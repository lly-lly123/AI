/**
 * 知识图谱系统
 * 构建系统知识库，支持智能查询和推理
 */

const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

class KnowledgeGraph {
  constructor() {
    this.graphPath = path.join(__dirname, '../../data/knowledge-graph.json');
    this.graph = this.loadGraph();
    this.relationships = {
      'depends_on': '依赖',
      'causes': '导致',
      'affects': '影响',
      'related_to': '相关',
      'similar_to': '相似',
      'solves': '解决'
    };
  }

  /**
   * 加载知识图谱
   */
  loadGraph() {
    try {
      const fsSync = require('fs');
      if (fsSync.existsSync(this.graphPath)) {
        const data = JSON.parse(fsSync.readFileSync(this.graphPath, 'utf8'));
        return data;
      }
    } catch (error) {
      logger.warn('加载知识图谱失败，使用空图谱', error);
    }
    
    return {
      nodes: [],
      edges: [],
      metadata: {
        version: '1.0',
        createdAt: Date.now(),
        lastUpdated: Date.now()
      }
    };
  }

  /**
   * 保存知识图谱
   */
  async saveGraph() {
    try {
      const dir = path.dirname(this.graphPath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(
        this.graphPath,
        JSON.stringify(this.graph, null, 2),
        'utf8'
      );
    } catch (error) {
      logger.error('保存知识图谱失败', error);
    }
  }

  /**
   * 添加节点
   */
  async addNode(node) {
    const nodeId = node.id || `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const existing = this.graph.nodes.find(n => n.id === nodeId);
    if (existing) {
      // 更新现有节点
      Object.assign(existing, node, { id: nodeId, updatedAt: Date.now() });
    } else {
      // 添加新节点
      this.graph.nodes.push({
        id: nodeId,
        ...node,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }
    
    await this.saveGraph();
    return nodeId;
  }

  /**
   * 添加关系
   */
  async addEdge(from, to, relationship, properties = {}) {
    const edgeId = `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 确保节点存在
    await this.ensureNodeExists(from);
    await this.ensureNodeExists(to);
    
    const edge = {
      id: edgeId,
      from,
      to,
      relationship,
      properties,
      createdAt: Date.now()
    };
    
    this.graph.edges.push(edge);
    await this.saveGraph();
    
    return edgeId;
  }

  /**
   * 确保节点存在
   */
  async ensureNodeExists(nodeId) {
    const exists = this.graph.nodes.some(n => n.id === nodeId);
    if (!exists) {
      await this.addNode({
        id: nodeId,
        type: 'unknown',
        label: nodeId
      });
    }
  }

  /**
   * 查询节点
   */
  findNode(nodeId) {
    return this.graph.nodes.find(n => n.id === nodeId);
  }

  /**
   * 查询关系
   */
  findRelationships(nodeId, relationship = null) {
    let edges = this.graph.edges.filter(e => 
      e.from === nodeId || e.to === nodeId
    );
    
    if (relationship) {
      edges = edges.filter(e => e.relationship === relationship);
    }
    
    return edges.map(edge => ({
      ...edge,
      relatedNode: edge.from === nodeId ? edge.to : edge.from,
      direction: edge.from === nodeId ? 'outgoing' : 'incoming'
    }));
  }

  /**
   * 查找相关节点
   */
  findRelatedNodes(nodeId, depth = 1) {
    const visited = new Set([nodeId]);
    const result = [];
    let currentLevel = [nodeId];
    
    for (let i = 0; i < depth; i++) {
      const nextLevel = [];
      
      for (const node of currentLevel) {
        const relationships = this.findRelationships(node);
        
        for (const rel of relationships) {
          if (!visited.has(rel.relatedNode)) {
            visited.add(rel.relatedNode);
            nextLevel.push(rel.relatedNode);
            result.push({
              node: rel.relatedNode,
              relationship: rel.relationship,
              distance: i + 1,
              path: [node, rel.relatedNode]
            });
          }
        }
      }
      
      currentLevel = nextLevel;
    }
    
    return result;
  }

  /**
   * 记录系统事件到知识图谱
   */
  async recordEvent(eventType, eventData, context = {}) {
    const eventNodeId = await this.addNode({
      type: 'event',
      label: eventType,
      properties: eventData
    });
    
    // 关联相关实体
    if (context.apiId) {
      await this.addEdge(eventNodeId, context.apiId, 'affects');
    }
    
    if (context.userId) {
      await this.addEdge(eventNodeId, context.userId, 'affects');
    }
    
    if (context.issueId) {
      await this.addEdge(eventNodeId, context.issueId, 'solves');
    }
    
    return eventNodeId;
  }

  /**
   * 记录问题解决方案
   */
  async recordSolution(problemId, solutionId, effectiveness) {
    await this.addEdge(problemId, solutionId, 'solves', {
      effectiveness,
      timestamp: Date.now()
    });
  }

  /**
   * 查找问题解决方案
   */
  async findSolutions(problemId) {
    const solutions = this.findRelationships(problemId, 'solves')
      .filter(rel => rel.direction === 'outgoing')
      .sort((a, b) => (b.properties.effectiveness || 0) - (a.properties.effectiveness || 0));
    
    return solutions.map(rel => ({
      solutionId: rel.relatedNode,
      effectiveness: rel.properties.effectiveness,
      timestamp: rel.properties.timestamp
    }));
  }

  /**
   * 智能查询
   */
  async intelligentQuery(query) {
    // 解析查询
    const parsed = this.parseQuery(query);
    
    // 查找匹配节点
    const matches = this.graph.nodes.filter(node => 
      this.matchesQuery(node, parsed)
    );
    
    // 扩展相关节点
    const expanded = [];
    for (const match of matches.slice(0, 10)) {
      const related = this.findRelatedNodes(match.id, 2);
      expanded.push({
        node: match,
        related
      });
    }
    
    return {
      matches,
      expanded,
      query: parsed
    };
  }

  /**
   * 解析查询
   */
  parseQuery(query) {
    // 简化实现：支持基本的关键词查询
    const keywords = query.toLowerCase().split(/\s+/);
    return {
      keywords,
      type: this.extractType(keywords),
      properties: this.extractProperties(keywords)
    };
  }

  /**
   * 提取类型
   */
  extractType(keywords) {
    const types = ['event', 'api', 'user', 'issue', 'solution'];
    return types.find(t => keywords.includes(t)) || null;
  }

  /**
   * 提取属性
   */
  extractProperties(keywords) {
    const props = {};
    // 简化实现
    return props;
  }

  /**
   * 匹配查询
   */
  matchesQuery(node, parsed) {
    // 检查类型
    if (parsed.type && node.type !== parsed.type) {
      return false;
    }
    
    // 检查关键词
    const nodeText = JSON.stringify(node).toLowerCase();
    return parsed.keywords.some(keyword => nodeText.includes(keyword));
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const byType = {};
    this.graph.nodes.forEach(node => {
      if (!byType[node.type]) {
        byType[node.type] = 0;
      }
      byType[node.type]++;
    });
    
    const byRelationship = {};
    this.graph.edges.forEach(edge => {
      if (!byRelationship[edge.relationship]) {
        byRelationship[edge.relationship] = 0;
      }
      byRelationship[edge.relationship]++;
    });
    
    return {
      nodes: this.graph.nodes.length,
      edges: this.graph.edges.length,
      byType,
      byRelationship
    };
  }
}

module.exports = new KnowledgeGraph();


 * 构建系统知识库，支持智能查询和推理
 */

const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

class KnowledgeGraph {
  constructor() {
    this.graphPath = path.join(__dirname, '../../data/knowledge-graph.json');
    this.graph = this.loadGraph();
    this.relationships = {
      'depends_on': '依赖',
      'causes': '导致',
      'affects': '影响',
      'related_to': '相关',
      'similar_to': '相似',
      'solves': '解决'
    };
  }

  /**
   * 加载知识图谱
   */
  loadGraph() {
    try {
      const fsSync = require('fs');
      if (fsSync.existsSync(this.graphPath)) {
        const data = JSON.parse(fsSync.readFileSync(this.graphPath, 'utf8'));
        return data;
      }
    } catch (error) {
      logger.warn('加载知识图谱失败，使用空图谱', error);
    }
    
    return {
      nodes: [],
      edges: [],
      metadata: {
        version: '1.0',
        createdAt: Date.now(),
        lastUpdated: Date.now()
      }
    };
  }

  /**
   * 保存知识图谱
   */
  async saveGraph() {
    try {
      const dir = path.dirname(this.graphPath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(
        this.graphPath,
        JSON.stringify(this.graph, null, 2),
        'utf8'
      );
    } catch (error) {
      logger.error('保存知识图谱失败', error);
    }
  }

  /**
   * 添加节点
   */
  async addNode(node) {
    const nodeId = node.id || `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const existing = this.graph.nodes.find(n => n.id === nodeId);
    if (existing) {
      // 更新现有节点
      Object.assign(existing, node, { id: nodeId, updatedAt: Date.now() });
    } else {
      // 添加新节点
      this.graph.nodes.push({
        id: nodeId,
        ...node,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }
    
    await this.saveGraph();
    return nodeId;
  }

  /**
   * 添加关系
   */
  async addEdge(from, to, relationship, properties = {}) {
    const edgeId = `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 确保节点存在
    await this.ensureNodeExists(from);
    await this.ensureNodeExists(to);
    
    const edge = {
      id: edgeId,
      from,
      to,
      relationship,
      properties,
      createdAt: Date.now()
    };
    
    this.graph.edges.push(edge);
    await this.saveGraph();
    
    return edgeId;
  }

  /**
   * 确保节点存在
   */
  async ensureNodeExists(nodeId) {
    const exists = this.graph.nodes.some(n => n.id === nodeId);
    if (!exists) {
      await this.addNode({
        id: nodeId,
        type: 'unknown',
        label: nodeId
      });
    }
  }

  /**
   * 查询节点
   */
  findNode(nodeId) {
    return this.graph.nodes.find(n => n.id === nodeId);
  }

  /**
   * 查询关系
   */
  findRelationships(nodeId, relationship = null) {
    let edges = this.graph.edges.filter(e => 
      e.from === nodeId || e.to === nodeId
    );
    
    if (relationship) {
      edges = edges.filter(e => e.relationship === relationship);
    }
    
    return edges.map(edge => ({
      ...edge,
      relatedNode: edge.from === nodeId ? edge.to : edge.from,
      direction: edge.from === nodeId ? 'outgoing' : 'incoming'
    }));
  }

  /**
   * 查找相关节点
   */
  findRelatedNodes(nodeId, depth = 1) {
    const visited = new Set([nodeId]);
    const result = [];
    let currentLevel = [nodeId];
    
    for (let i = 0; i < depth; i++) {
      const nextLevel = [];
      
      for (const node of currentLevel) {
        const relationships = this.findRelationships(node);
        
        for (const rel of relationships) {
          if (!visited.has(rel.relatedNode)) {
            visited.add(rel.relatedNode);
            nextLevel.push(rel.relatedNode);
            result.push({
              node: rel.relatedNode,
              relationship: rel.relationship,
              distance: i + 1,
              path: [node, rel.relatedNode]
            });
          }
        }
      }
      
      currentLevel = nextLevel;
    }
    
    return result;
  }

  /**
   * 记录系统事件到知识图谱
   */
  async recordEvent(eventType, eventData, context = {}) {
    const eventNodeId = await this.addNode({
      type: 'event',
      label: eventType,
      properties: eventData
    });
    
    // 关联相关实体
    if (context.apiId) {
      await this.addEdge(eventNodeId, context.apiId, 'affects');
    }
    
    if (context.userId) {
      await this.addEdge(eventNodeId, context.userId, 'affects');
    }
    
    if (context.issueId) {
      await this.addEdge(eventNodeId, context.issueId, 'solves');
    }
    
    return eventNodeId;
  }

  /**
   * 记录问题解决方案
   */
  async recordSolution(problemId, solutionId, effectiveness) {
    await this.addEdge(problemId, solutionId, 'solves', {
      effectiveness,
      timestamp: Date.now()
    });
  }

  /**
   * 查找问题解决方案
   */
  async findSolutions(problemId) {
    const solutions = this.findRelationships(problemId, 'solves')
      .filter(rel => rel.direction === 'outgoing')
      .sort((a, b) => (b.properties.effectiveness || 0) - (a.properties.effectiveness || 0));
    
    return solutions.map(rel => ({
      solutionId: rel.relatedNode,
      effectiveness: rel.properties.effectiveness,
      timestamp: rel.properties.timestamp
    }));
  }

  /**
   * 智能查询
   */
  async intelligentQuery(query) {
    // 解析查询
    const parsed = this.parseQuery(query);
    
    // 查找匹配节点
    const matches = this.graph.nodes.filter(node => 
      this.matchesQuery(node, parsed)
    );
    
    // 扩展相关节点
    const expanded = [];
    for (const match of matches.slice(0, 10)) {
      const related = this.findRelatedNodes(match.id, 2);
      expanded.push({
        node: match,
        related
      });
    }
    
    return {
      matches,
      expanded,
      query: parsed
    };
  }

  /**
   * 解析查询
   */
  parseQuery(query) {
    // 简化实现：支持基本的关键词查询
    const keywords = query.toLowerCase().split(/\s+/);
    return {
      keywords,
      type: this.extractType(keywords),
      properties: this.extractProperties(keywords)
    };
  }

  /**
   * 提取类型
   */
  extractType(keywords) {
    const types = ['event', 'api', 'user', 'issue', 'solution'];
    return types.find(t => keywords.includes(t)) || null;
  }

  /**
   * 提取属性
   */
  extractProperties(keywords) {
    const props = {};
    // 简化实现
    return props;
  }

  /**
   * 匹配查询
   */
  matchesQuery(node, parsed) {
    // 检查类型
    if (parsed.type && node.type !== parsed.type) {
      return false;
    }
    
    // 检查关键词
    const nodeText = JSON.stringify(node).toLowerCase();
    return parsed.keywords.some(keyword => nodeText.includes(keyword));
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const byType = {};
    this.graph.nodes.forEach(node => {
      if (!byType[node.type]) {
        byType[node.type] = 0;
      }
      byType[node.type]++;
    });
    
    const byRelationship = {};
    this.graph.edges.forEach(edge => {
      if (!byRelationship[edge.relationship]) {
        byRelationship[edge.relationship] = 0;
      }
      byRelationship[edge.relationship]++;
    });
    
    return {
      nodes: this.graph.nodes.length,
      edges: this.graph.edges.length,
      byType,
      byRelationship
    };
  }
}

module.exports = new KnowledgeGraph();


 * 构建系统知识库，支持智能查询和推理
 */

const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

class KnowledgeGraph {
  constructor() {
    this.graphPath = path.join(__dirname, '../../data/knowledge-graph.json');
    this.graph = this.loadGraph();
    this.relationships = {
      'depends_on': '依赖',
      'causes': '导致',
      'affects': '影响',
      'related_to': '相关',
      'similar_to': '相似',
      'solves': '解决'
    };
  }

  /**
   * 加载知识图谱
   */
  loadGraph() {
    try {
      const fsSync = require('fs');
      if (fsSync.existsSync(this.graphPath)) {
        const data = JSON.parse(fsSync.readFileSync(this.graphPath, 'utf8'));
        return data;
      }
    } catch (error) {
      logger.warn('加载知识图谱失败，使用空图谱', error);
    }
    
    return {
      nodes: [],
      edges: [],
      metadata: {
        version: '1.0',
        createdAt: Date.now(),
        lastUpdated: Date.now()
      }
    };
  }

  /**
   * 保存知识图谱
   */
  async saveGraph() {
    try {
      const dir = path.dirname(this.graphPath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(
        this.graphPath,
        JSON.stringify(this.graph, null, 2),
        'utf8'
      );
    } catch (error) {
      logger.error('保存知识图谱失败', error);
    }
  }

  /**
   * 添加节点
   */
  async addNode(node) {
    const nodeId = node.id || `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const existing = this.graph.nodes.find(n => n.id === nodeId);
    if (existing) {
      // 更新现有节点
      Object.assign(existing, node, { id: nodeId, updatedAt: Date.now() });
    } else {
      // 添加新节点
      this.graph.nodes.push({
        id: nodeId,
        ...node,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }
    
    await this.saveGraph();
    return nodeId;
  }

  /**
   * 添加关系
   */
  async addEdge(from, to, relationship, properties = {}) {
    const edgeId = `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 确保节点存在
    await this.ensureNodeExists(from);
    await this.ensureNodeExists(to);
    
    const edge = {
      id: edgeId,
      from,
      to,
      relationship,
      properties,
      createdAt: Date.now()
    };
    
    this.graph.edges.push(edge);
    await this.saveGraph();
    
    return edgeId;
  }

  /**
   * 确保节点存在
   */
  async ensureNodeExists(nodeId) {
    const exists = this.graph.nodes.some(n => n.id === nodeId);
    if (!exists) {
      await this.addNode({
        id: nodeId,
        type: 'unknown',
        label: nodeId
      });
    }
  }

  /**
   * 查询节点
   */
  findNode(nodeId) {
    return this.graph.nodes.find(n => n.id === nodeId);
  }

  /**
   * 查询关系
   */
  findRelationships(nodeId, relationship = null) {
    let edges = this.graph.edges.filter(e => 
      e.from === nodeId || e.to === nodeId
    );
    
    if (relationship) {
      edges = edges.filter(e => e.relationship === relationship);
    }
    
    return edges.map(edge => ({
      ...edge,
      relatedNode: edge.from === nodeId ? edge.to : edge.from,
      direction: edge.from === nodeId ? 'outgoing' : 'incoming'
    }));
  }

  /**
   * 查找相关节点
   */
  findRelatedNodes(nodeId, depth = 1) {
    const visited = new Set([nodeId]);
    const result = [];
    let currentLevel = [nodeId];
    
    for (let i = 0; i < depth; i++) {
      const nextLevel = [];
      
      for (const node of currentLevel) {
        const relationships = this.findRelationships(node);
        
        for (const rel of relationships) {
          if (!visited.has(rel.relatedNode)) {
            visited.add(rel.relatedNode);
            nextLevel.push(rel.relatedNode);
            result.push({
              node: rel.relatedNode,
              relationship: rel.relationship,
              distance: i + 1,
              path: [node, rel.relatedNode]
            });
          }
        }
      }
      
      currentLevel = nextLevel;
    }
    
    return result;
  }

  /**
   * 记录系统事件到知识图谱
   */
  async recordEvent(eventType, eventData, context = {}) {
    const eventNodeId = await this.addNode({
      type: 'event',
      label: eventType,
      properties: eventData
    });
    
    // 关联相关实体
    if (context.apiId) {
      await this.addEdge(eventNodeId, context.apiId, 'affects');
    }
    
    if (context.userId) {
      await this.addEdge(eventNodeId, context.userId, 'affects');
    }
    
    if (context.issueId) {
      await this.addEdge(eventNodeId, context.issueId, 'solves');
    }
    
    return eventNodeId;
  }

  /**
   * 记录问题解决方案
   */
  async recordSolution(problemId, solutionId, effectiveness) {
    await this.addEdge(problemId, solutionId, 'solves', {
      effectiveness,
      timestamp: Date.now()
    });
  }

  /**
   * 查找问题解决方案
   */
  async findSolutions(problemId) {
    const solutions = this.findRelationships(problemId, 'solves')
      .filter(rel => rel.direction === 'outgoing')
      .sort((a, b) => (b.properties.effectiveness || 0) - (a.properties.effectiveness || 0));
    
    return solutions.map(rel => ({
      solutionId: rel.relatedNode,
      effectiveness: rel.properties.effectiveness,
      timestamp: rel.properties.timestamp
    }));
  }

  /**
   * 智能查询
   */
  async intelligentQuery(query) {
    // 解析查询
    const parsed = this.parseQuery(query);
    
    // 查找匹配节点
    const matches = this.graph.nodes.filter(node => 
      this.matchesQuery(node, parsed)
    );
    
    // 扩展相关节点
    const expanded = [];
    for (const match of matches.slice(0, 10)) {
      const related = this.findRelatedNodes(match.id, 2);
      expanded.push({
        node: match,
        related
      });
    }
    
    return {
      matches,
      expanded,
      query: parsed
    };
  }

  /**
   * 解析查询
   */
  parseQuery(query) {
    // 简化实现：支持基本的关键词查询
    const keywords = query.toLowerCase().split(/\s+/);
    return {
      keywords,
      type: this.extractType(keywords),
      properties: this.extractProperties(keywords)
    };
  }

  /**
   * 提取类型
   */
  extractType(keywords) {
    const types = ['event', 'api', 'user', 'issue', 'solution'];
    return types.find(t => keywords.includes(t)) || null;
  }

  /**
   * 提取属性
   */
  extractProperties(keywords) {
    const props = {};
    // 简化实现
    return props;
  }

  /**
   * 匹配查询
   */
  matchesQuery(node, parsed) {
    // 检查类型
    if (parsed.type && node.type !== parsed.type) {
      return false;
    }
    
    // 检查关键词
    const nodeText = JSON.stringify(node).toLowerCase();
    return parsed.keywords.some(keyword => nodeText.includes(keyword));
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const byType = {};
    this.graph.nodes.forEach(node => {
      if (!byType[node.type]) {
        byType[node.type] = 0;
      }
      byType[node.type]++;
    });
    
    const byRelationship = {};
    this.graph.edges.forEach(edge => {
      if (!byRelationship[edge.relationship]) {
        byRelationship[edge.relationship] = 0;
      }
      byRelationship[edge.relationship]++;
    });
    
    return {
      nodes: this.graph.nodes.length,
      edges: this.graph.edges.length,
      byType,
      byRelationship
    };
  }
}

module.exports = new KnowledgeGraph();

