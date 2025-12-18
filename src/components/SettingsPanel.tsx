import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Database, 
  Globe, 
  Webhook, 
  Brain, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Eye, 
  EyeOff, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Key,
  Server,
  Zap,
  Link,
  Shield,
  Monitor,
  Cpu,
  Cloud,
  Lock,
  Unlock,
  Copy,
  RefreshCw,
  Activity,
  Star
} from 'lucide-react';

interface DatabaseConfig {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'supabase' | 'firebase';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  status: 'connected' | 'disconnected' | 'testing';
  lastConnected?: string;
}

interface APIConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  headers: Record<string, string>;
  timeout: number;
  retries: number;
  status: 'active' | 'inactive' | 'testing';
  lastUsed?: string;
}

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  secret: string;
  events: string[];
  status: 'active' | 'inactive' | 'testing';
  lastTriggered?: string;
}

interface LLMConfig {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'deepseek' | 'gemini' | 'cohere' | 'huggingface';
  apiKey: string;
  baseUrl?: string;
  model: string;
  temperature: number;
  maxTokens: number;
  status: 'active' | 'inactive' | 'testing';
  isDefault: boolean;
  lastUsed?: string;
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'databases' | 'apis' | 'webhooks' | 'llms'>('databases');
  const [databases, setDatabases] = useState<DatabaseConfig[]>([]);
  const [apis, setApis] = useState<APIConfig[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [llms, setLlms] = useState<LLMConfig[]>([]);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [editingItem, setEditingItem] = useState<string | null>(null);

  // Load configurations from localStorage on mount
  useEffect(() => {
    const savedDatabases = localStorage.getItem('attendance_databases');
    const savedApis = localStorage.getItem('attendance_apis');
    const savedWebhooks = localStorage.getItem('attendance_webhooks');
    const savedLlms = localStorage.getItem('attendance_llms');

    if (savedDatabases) setDatabases(JSON.parse(savedDatabases));
    if (savedApis) setApis(JSON.parse(savedApis));
    if (savedWebhooks) setWebhooks(JSON.parse(savedWebhooks));
    if (savedLlms) {
      setLlms(JSON.parse(savedLlms));
    } else {
      // Initialize with default LLM configurations
      const defaultLlms: LLMConfig[] = [
        {
          id: 'deepseek-default',
          name: 'Bayu GPT (DeepSeek)',
          provider: 'deepseek',
          apiKey: '',
          baseUrl: 'https://api.deepseek.com',
          model: 'deepseek-chat',
          temperature: 0.7,
          maxTokens: 1500,
          status: 'inactive',
          isDefault: true,
          lastUsed: undefined
        }
      ];
      setLlms(defaultLlms);
      localStorage.setItem('attendance_llms', JSON.stringify(defaultLlms));
    }
  }, []);

  // Save configurations to localStorage
  const saveConfigurations = () => {
    localStorage.setItem('attendance_databases', JSON.stringify(databases));
    localStorage.setItem('attendance_apis', JSON.stringify(apis));
    localStorage.setItem('attendance_webhooks', JSON.stringify(webhooks));
    localStorage.setItem('attendance_llms', JSON.stringify(llms));
  };

  // Database functions
  const addDatabase = () => {
    const newDb: DatabaseConfig = {
      id: `db_${Date.now()}`,
      name: 'New Database',
      type: 'postgresql',
      host: 'localhost',
      port: 5432,
      database: '',
      username: '',
      password: '',
      ssl: false,
      status: 'disconnected'
    };
    setDatabases([...databases, newDb]);
    setEditingItem(newDb.id);
  };

  const updateDatabase = (id: string, updates: Partial<DatabaseConfig>) => {
    setDatabases(databases.map(db => db.id === id ? { ...db, ...updates } : db));
  };

  const deleteDatabase = (id: string) => {
    setDatabases(databases.filter(db => db.id !== id));
  };

  const testDatabase = async (id: string) => {
    updateDatabase(id, { status: 'testing' });
    // Simulate database connection test
    setTimeout(() => {
      updateDatabase(id, { 
        status: Math.random() > 0.3 ? 'connected' : 'disconnected',
        lastConnected: new Date().toISOString()
      });
    }, 2000);
  };

  // API functions
  const addAPI = () => {
    const newApi: APIConfig = {
      id: `api_${Date.now()}`,
      name: 'New API',
      baseUrl: 'https://api.example.com',
      apiKey: '',
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
      retries: 3,
      status: 'inactive'
    };
    setApis([...apis, newApi]);
    setEditingItem(newApi.id);
  };

  const updateAPI = (id: string, updates: Partial<APIConfig>) => {
    setApis(apis.map(api => api.id === id ? { ...api, ...updates } : api));
  };

  const deleteAPI = (id: string) => {
    setApis(apis.filter(api => api.id !== id));
  };

  const testAPI = async (id: string) => {
    updateAPI(id, { status: 'testing' });
    // Simulate API test
    setTimeout(() => {
      updateAPI(id, { 
        status: Math.random() > 0.2 ? 'active' : 'inactive',
        lastUsed: new Date().toISOString()
      });
    }, 1500);
  };

  // Webhook functions
  const addWebhook = () => {
    const newWebhook: WebhookConfig = {
      id: `webhook_${Date.now()}`,
      name: 'New Webhook',
      url: 'https://example.com/webhook',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      secret: '',
      events: ['attendance.created', 'attendance.updated'],
      status: 'inactive'
    };
    setWebhooks([...webhooks, newWebhook]);
    setEditingItem(newWebhook.id);
  };

  const updateWebhook = (id: string, updates: Partial<WebhookConfig>) => {
    setWebhooks(webhooks.map(webhook => webhook.id === id ? { ...webhook, ...updates } : webhook));
  };

  const deleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter(webhook => webhook.id !== id));
  };

  const testWebhook = async (id: string) => {
    updateWebhook(id, { status: 'testing' });
    // Simulate webhook test
    setTimeout(() => {
      updateWebhook(id, { 
        status: Math.random() > 0.25 ? 'active' : 'inactive',
        lastTriggered: new Date().toISOString()
      });
    }, 1000);
  };

  // LLM functions
  const addLLM = () => {
    const newLlm: LLMConfig = {
      id: `llm_${Date.now()}`,
      name: 'New LLM',
      provider: 'openai',
      apiKey: '',
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 1000,
      status: 'inactive',
      isDefault: false
    };
    setLlms([...llms, newLlm]);
    setEditingItem(newLlm.id);
  };

  const updateLLM = (id: string, updates: Partial<LLMConfig>) => {
    let updatedLlms = llms.map(llm => llm.id === id ? { ...llm, ...updates } : llm);
    
    // If setting as default, remove default from others
    if (updates.isDefault) {
      updatedLlms = updatedLlms.map(llm => ({ ...llm, isDefault: llm.id === id }));
    }
    
    setLlms(updatedLlms);
    
    // Update environment variable for chatbot integration
    if (updates.isDefault || (updates.apiKey && llms.find(l => l.id === id)?.isDefault)) {
      const defaultLlm = updatedLlms.find(l => l.isDefault);
      if (defaultLlm && defaultLlm.apiKey) {
        // Store in environment for chatbot use
        (window as any).VITE_DEEPSEEK_API_KEY = defaultLlm.apiKey;
        localStorage.setItem('chatbot_api_key', defaultLlm.apiKey);
        localStorage.setItem('chatbot_provider', defaultLlm.provider);
        localStorage.setItem('chatbot_model', defaultLlm.model);
      }
    }
  };

  const deleteLLM = (id: string) => {
    setLlms(llms.filter(llm => llm.id !== id));
  };

  const testLLM = async (id: string) => {
    updateLLM(id, { status: 'testing' });
    // Simulate LLM test
    setTimeout(() => {
      updateLLM(id, { 
        status: Math.random() > 0.15 ? 'active' : 'inactive',
        lastUsed: new Date().toISOString()
      });
    }, 2500);
  };

  // Save all configurations
  useEffect(() => {
    saveConfigurations();
  }, [databases, apis, webhooks, llms]);

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'testing':
        return <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />;
      default:
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai': return <Brain className="w-4 h-4 text-green-400" />;
      case 'anthropic': return <Cpu className="w-4 h-4 text-orange-400" />;
      case 'deepseek': return <Zap className="w-4 h-4 text-blue-400" />;
      case 'gemini': return <Cloud className="w-4 h-4 text-purple-400" />;
      default: return <Brain className="w-4 h-4 text-gray-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900/95 to-blue-900/95 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-blue-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Advanced Settings</h2>
              <p className="text-slate-300 text-sm">Manage integrations and configurations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-blue-500/20">
          {[
            { id: 'databases', label: 'Databases', icon: Database, count: databases.length },
            { id: 'apis', label: 'APIs', icon: Globe, count: apis.length },
            { id: 'webhooks', label: 'Webhooks', icon: Webhook, count: webhooks.length },
            { id: 'llms', label: 'LLMs', icon: Brain, count: llms.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-400 text-blue-400 bg-blue-500/10'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-700/30'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
              <span className="bg-slate-700 text-white text-xs px-2 py-1 rounded-full">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Databases Tab */}
          {activeTab === 'databases' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Database className="w-5 h-5 mr-2 text-blue-400" />
                  Database Connections
                </h3>
                <button
                  onClick={addDatabase}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Database</span>
                </button>
              </div>

              <div className="grid gap-4">
                {databases.map(db => (
                  <div key={db.id} className="bg-slate-800/50 border border-slate-600/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Server className="w-5 h-5 text-blue-400" />
                        {editingItem === db.id ? (
                          <input
                            type="text"
                            value={db.name}
                            onChange={(e) => updateDatabase(db.id, { name: e.target.value })}
                            className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                          />
                        ) : (
                          <h4 className="font-semibold text-white">{db.name}</h4>
                        )}
                        {getStatusIcon(db.status)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => testDatabase(db.id)}
                          className="p-2 text-yellow-400 hover:bg-yellow-400/20 rounded-lg transition-colors"
                          title="Test Connection"
                        >
                          <TestTube className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingItem(editingItem === db.id ? null : db.id)}
                          className="p-2 text-blue-400 hover:bg-blue-400/20 rounded-lg transition-colors"
                        >
                          {editingItem === db.id ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => deleteDatabase(db.id)}
                          className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {editingItem === db.id && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-slate-300 mb-1">Type</label>
                          <select
                            value={db.type}
                            onChange={(e) => updateDatabase(db.id, { type: e.target.value as any })}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                          >
                            <option value="postgresql">PostgreSQL</option>
                            <option value="mysql">MySQL</option>
                            <option value="mongodb">MongoDB</option>
                            <option value="supabase">Supabase</option>
                            <option value="firebase">Firebase</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-slate-300 mb-1">Host</label>
                          <input
                            type="text"
                            value={db.host}
                            onChange={(e) => updateDatabase(db.id, { host: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-300 mb-1">Port</label>
                          <input
                            type="number"
                            value={db.port}
                            onChange={(e) => updateDatabase(db.id, { port: parseInt(e.target.value) })}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-300 mb-1">Database</label>
                          <input
                            type="text"
                            value={db.database}
                            onChange={(e) => updateDatabase(db.id, { database: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-300 mb-1">Username</label>
                          <input
                            type="text"
                            value={db.username}
                            onChange={(e) => updateDatabase(db.id, { username: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-300 mb-1">Password</label>
                          <div className="relative">
                            <input
                              type={showPasswords[db.id] ? 'text' : 'password'}
                              value={db.password}
                              onChange={(e) => updateDatabase(db.id, { password: e.target.value })}
                              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 pr-10 text-white text-sm"
                            />
                            <button
                              onClick={() => togglePasswordVisibility(db.id)}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                              {showPasswords[db.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={db.ssl}
                              onChange={(e) => updateDatabase(db.id, { ssl: e.target.checked })}
                              className="rounded border-slate-600 bg-slate-700 text-blue-500"
                            />
                            <span className="text-sm text-slate-300">Use SSL</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {editingItem !== db.id && (
                      <div className="text-sm text-slate-400">
                        <p>{db.type.toUpperCase()} • {db.host}:{db.port}</p>
                        {db.lastConnected && (
                          <p>Last connected: {new Date(db.lastConnected).toLocaleString()}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* APIs Tab */}
          {activeTab === 'apis' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-green-400" />
                  API Integrations
                </h3>
                <button
                  onClick={addAPI}
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add API</span>
                </button>
              </div>

              <div className="grid gap-4">
                {apis.map(api => (
                  <div key={api.id} className="bg-slate-800/50 border border-slate-600/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Link className="w-5 h-5 text-green-400" />
                        {editingItem === api.id ? (
                          <input
                            type="text"
                            value={api.name}
                            onChange={(e) => updateAPI(api.id, { name: e.target.value })}
                            className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                          />
                        ) : (
                          <h4 className="font-semibold text-white">{api.name}</h4>
                        )}
                        {getStatusIcon(api.status)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => testAPI(api.id)}
                          className="p-2 text-yellow-400 hover:bg-yellow-400/20 rounded-lg transition-colors"
                          title="Test API"
                        >
                          <TestTube className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingItem(editingItem === api.id ? null : api.id)}
                          className="p-2 text-blue-400 hover:bg-blue-400/20 rounded-lg transition-colors"
                        >
                          {editingItem === api.id ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => deleteAPI(api.id)}
                          className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {editingItem === api.id && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-sm text-slate-300 mb-1">Base URL</label>
                          <input
                            type="url"
                            value={api.baseUrl}
                            onChange={(e) => updateAPI(api.id, { baseUrl: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm text-slate-300 mb-1">API Key</label>
                          <div className="relative">
                            <input
                              type={showPasswords[api.id] ? 'text' : 'password'}
                              value={api.apiKey}
                              onChange={(e) => updateAPI(api.id, { apiKey: e.target.value })}
                              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 pr-20 text-white text-sm"
                            />
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                              <button
                                onClick={() => copyToClipboard(api.apiKey)}
                                className="text-slate-400 hover:text-white"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => togglePasswordVisibility(api.id)}
                                className="text-slate-400 hover:text-white"
                              >
                                {showPasswords[api.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm text-slate-300 mb-1">Timeout (ms)</label>
                          <input
                            type="number"
                            value={api.timeout}
                            onChange={(e) => updateAPI(api.id, { timeout: parseInt(e.target.value) })}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-300 mb-1">Retries</label>
                          <input
                            type="number"
                            value={api.retries}
                            onChange={(e) => updateAPI(api.id, { retries: parseInt(e.target.value) })}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                      </div>
                    )}

                    {editingItem !== api.id && (
                      <div className="text-sm text-slate-400">
                        <p>{api.baseUrl}</p>
                        {api.lastUsed && (
                          <p>Last used: {new Date(api.lastUsed).toLocaleString()}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Webhooks Tab */}
          {activeTab === 'webhooks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Webhook className="w-5 h-5 mr-2 text-purple-400" />
                  Webhook Endpoints
                </h3>
                <button
                  onClick={addWebhook}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Webhook</span>
                </button>
              </div>

              <div className="grid gap-4">
                {webhooks.map(webhook => (
                  <div key={webhook.id} className="bg-slate-800/50 border border-slate-600/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Zap className="w-5 h-5 text-purple-400" />
                        {editingItem === webhook.id ? (
                          <input
                            type="text"
                            value={webhook.name}
                            onChange={(e) => updateWebhook(webhook.id, { name: e.target.value })}
                            className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                          />
                        ) : (
                          <h4 className="font-semibold text-white">{webhook.name}</h4>
                        )}
                        {getStatusIcon(webhook.status)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => testWebhook(webhook.id)}
                          className="p-2 text-yellow-400 hover:bg-yellow-400/20 rounded-lg transition-colors"
                          title="Test Webhook"
                        >
                          <TestTube className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingItem(editingItem === webhook.id ? null : webhook.id)}
                          className="p-2 text-blue-400 hover:bg-blue-400/20 rounded-lg transition-colors"
                        >
                          {editingItem === webhook.id ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => deleteWebhook(webhook.id)}
                          className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {editingItem === webhook.id && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-sm text-slate-300 mb-1">Webhook URL</label>
                          <input
                            type="url"
                            value={webhook.url}
                            onChange={(e) => updateWebhook(webhook.id, { url: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-300 mb-1">Method</label>
                          <select
                            value={webhook.method}
                            onChange={(e) => updateWebhook(webhook.id, { method: e.target.value as any })}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                          >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-slate-300 mb-1">Secret</label>
                          <div className="relative">
                            <input
                              type={showPasswords[webhook.id] ? 'text' : 'password'}
                              value={webhook.secret}
                              onChange={(e) => updateWebhook(webhook.id, { secret: e.target.value })}
                              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 pr-10 text-white text-sm"
                            />
                            <button
                              onClick={() => togglePasswordVisibility(webhook.id)}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                              {showPasswords[webhook.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm text-slate-300 mb-1">Events</label>
                          <div className="flex flex-wrap gap-2">
                            {['attendance.created', 'attendance.updated', 'attendance.deleted', 'employee.created', 'employee.updated'].map(event => (
                              <label key={event} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={webhook.events.includes(event)}
                                  onChange={(e) => {
                                    const events = e.target.checked
                                      ? [...webhook.events, event]
                                      : webhook.events.filter(e => e !== event);
                                    updateWebhook(webhook.id, { events });
                                  }}
                                  className="rounded border-slate-600 bg-slate-700 text-purple-500"
                                />
                                <span className="text-xs text-slate-300">{event}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {editingItem !== webhook.id && (
                      <div className="text-sm text-slate-400">
                        <p>{webhook.method} {webhook.url}</p>
                        <p>Events: {webhook.events.join(', ')}</p>
                        {webhook.lastTriggered && (
                          <p>Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LLMs Tab */}
          {activeTab === 'llms' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-cyan-400" />
                  LLM Configurations
                  <span className="ml-2 text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full">
                    Chatbot Integration
                  </span>
                </h3>
                <button
                  onClick={addLLM}
                  className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add LLM</span>
                </button>
              </div>

              <div className="grid gap-4">
                {llms.map(llm => (
                  <div key={llm.id} className={`bg-slate-800/50 border rounded-xl p-4 ${
                    llm.isDefault ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-slate-600/50'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getProviderIcon(llm.provider)}
                        {editingItem === llm.id ? (
                          <input
                            type="text"
                            value={llm.name}
                            onChange={(e) => updateLLM(llm.id, { name: e.target.value })}
                            className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-white">{llm.name}</h4>
                            {llm.isDefault && (
                              <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-1 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                        )}
                        {getStatusIcon(llm.status)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateLLM(llm.id, { isDefault: !llm.isDefault })}
                          className={`p-2 rounded-lg transition-colors ${
                            llm.isDefault 
                              ? 'text-cyan-400 bg-cyan-400/20' 
                              : 'text-slate-400 hover:bg-slate-700/50'
                          }`}
                          title="Set as Default"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => testLLM(llm.id)}
                          className="p-2 text-yellow-400 hover:bg-yellow-400/20 rounded-lg transition-colors"
                          title="Test LLM"
                        >
                          <TestTube className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingItem(editingItem === llm.id ? null : llm.id)}
                          className="p-2 text-blue-400 hover:bg-blue-400/20 rounded-lg transition-colors"
                        >
                          {editingItem === llm.id ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => deleteLLM(llm.id)}
                          className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {editingItem === llm.id && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-slate-300 mb-1">Provider</label>
                          <select
                            value={llm.provider}
                            onChange={(e) => updateLLM(llm.id, { provider: e.target.value as any })}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                          >
                            <option value="openai">OpenAI</option>
                            <option value="anthropic">Anthropic</option>
                            <option value="deepseek">DeepSeek</option>
                            <option value="gemini">Google Gemini</option>
                            <option value="cohere">Cohere</option>
                            <option value="huggingface">Hugging Face</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-slate-300 mb-1">Model</label>
                          <input
                            type="text"
                            value={llm.model}
                            onChange={(e) => updateLLM(llm.id, { model: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                            placeholder="e.g., gpt-4, claude-3, deepseek-chat"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm text-slate-300 mb-1">API Key</label>
                          <div className="relative">
                            <input
                              type={showPasswords[llm.id] ? 'text' : 'password'}
                              value={llm.apiKey}
                              onChange={(e) => updateLLM(llm.id, { apiKey: e.target.value })}
                              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 pr-20 text-white text-sm"
                              placeholder="Enter your API key"
                            />
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                              <button
                                onClick={() => copyToClipboard(llm.apiKey)}
                                className="text-slate-400 hover:text-white"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => togglePasswordVisibility(llm.id)}
                                className="text-slate-400 hover:text-white"
                              >
                                {showPasswords[llm.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm text-slate-300 mb-1">Base URL (Optional)</label>
                          <input
                            type="url"
                            value={llm.baseUrl || ''}
                            onChange={(e) => updateLLM(llm.id, { baseUrl: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                            placeholder="Custom API endpoint (optional)"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-300 mb-1">Temperature</label>
                          <input
                            type="number"
                            min="0"
                            max="2"
                            step="0.1"
                            value={llm.temperature}
                            onChange={(e) => updateLLM(llm.id, { temperature: parseFloat(e.target.value) })}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-300 mb-1">Max Tokens</label>
                          <input
                            type="number"
                            min="1"
                            max="8000"
                            value={llm.maxTokens}
                            onChange={(e) => updateLLM(llm.id, { maxTokens: parseInt(e.target.value) })}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                      </div>
                    )}

                    {editingItem !== llm.id && (
                      <div className="text-sm text-slate-400">
                        <p>{llm.provider} • {llm.model}</p>
                        <p>Temperature: {llm.temperature} • Max Tokens: {llm.maxTokens}</p>
                        {llm.lastUsed && (
                          <p>Last used: {new Date(llm.lastUsed).toLocaleString()}</p>
                        )}
                        {llm.isDefault && (
                          <div className="mt-2 flex items-center space-x-2 text-cyan-300">
                            <Activity className="w-4 h-4" />
                            <span>Active in chatbot</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* LLM Integration Info */}
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  <h4 className="font-semibold text-cyan-300">Chatbot Integration</h4>
                </div>
                <p className="text-sm text-slate-300 mb-2">
                  The default LLM will be automatically used by the Bayu GPT Assistant chatbot. 
                  Make sure to set an API key for the default LLM to enable AI responses.
                </p>
                <div className="text-xs text-slate-400">
                  <p>• Default LLM API key is securely stored and used for chat responses</p>
                  <p>• Switch between different LLM providers by changing the default</p>
                  <p>• Test connections to ensure your API keys are working</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-blue-500/20 p-4">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <div className="flex items-center space-x-4">
              <span>Total Configurations: {databases.length + apis.length + webhooks.length + llms.length}</span>
              <span>•</span>
              <span>Active: {[...databases, ...apis, ...webhooks, ...llms].filter(item => 
                item.status === 'connected' || item.status === 'active'
              ).length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Auto-saved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;