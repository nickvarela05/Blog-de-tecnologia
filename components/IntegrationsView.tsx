import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import Dropdown, { DropdownOption } from './Dropdown';

// --- TYPE DEFINITIONS ---
interface IntegrationBase {
  id: string;
  type: 'ga' | 'n8n' | 'agent' | 'db' | 'whatsapp';
}
interface GaIntegration extends IntegrationBase {
  type: 'ga';
  name: string;
  measurementId: string;
  isConnected: boolean;
}
interface N8nIntegration extends IntegrationBase {
  type: 'n8n';
  webhookUrl: string;
  isConnected: boolean;
}
interface AgentIntegration extends IntegrationBase {
  type: 'agent';
  apiKey: string;
  isConnected: boolean;
}
interface DbIntegration extends IntegrationBase {
  type: 'db';
  provider: 'gcp' | 'aws' | 'azure' | 'other';
  host: string;
  port: string;
  username: string;
  databaseName: string;
  isConnected: boolean;
}
interface WhatsAppIntegration extends IntegrationBase {
  type: 'whatsapp';
  provider: 'twilio' | 'zenvia' | 'gupshup' | 'other';
  accountSid: string;
  authToken: string;
  phoneNumberId: string;
  isConnected: boolean;
}
type Integration = GaIntegration | N8nIntegration | AgentIntegration | DbIntegration | WhatsAppIntegration;


const LOCAL_STORAGE_KEY = 'innovateFlowIntegrations';

// --- DYNAMIC CARD COMPONENTS ---

const GoogleAnalyticsCard: React.FC<{
    integration: GaIntegration;
    onUpdate: (integration: GaIntegration) => void;
    onDelete: (id: string) => void;
}> = ({ integration, onUpdate, onDelete }) => {
    const handleConnectGa = () => {
        if (integration.measurementId.trim().toUpperCase().startsWith('G-') && integration.name.trim() !== '') {
            onUpdate({ ...integration, isConnected: true });
        } else {
            alert("Por favor, insira um nome e um ID de Métrica do Google Analytics válido (ex: G-XXXXXXXXXX).");
        }
    };
    
    const handleDisconnectGa = () => {
        onUpdate({ ...integration, isConnected: false });
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-300 dark:border-slate-700 flex flex-col">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Google Analytics</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Conecte sua conta do Google Analytics para obter insights detalhados sobre o tráfego do seu site.</p>
                </div>
                 <div className="flex items-center gap-2">
                    <div className="h-12 w-12 rounded bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-400 flex-shrink-0">
                        <Icon type="google" className="h-7 w-7" />
                    </div>
                    <button onClick={() => onDelete(integration.id)} className="text-gray-400 hover:text-red-500"><Icon type="trash" className="h-5 w-5" /></button>
                </div>
            </div>
            <div className="mt-6 flex-grow space-y-4">
                 <div>
                    <label htmlFor={`ga-name-${integration.id}`} className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome da Integração</label>
                    <input
                        id={`ga-name-${integration.id}`}
                        type="text"
                        value={integration.name}
                        onChange={(e) => onUpdate({ ...integration, name: e.target.value })}
                        placeholder="Ex: Blog Principal"
                        disabled={integration.isConnected}
                        className="w-full mt-1 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md py-2 px-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 dark:disabled:bg-slate-800 disabled:text-gray-500"
                    />
                </div>
                <div>
                    <label htmlFor={`ga-id-${integration.id}`} className="text-sm font-medium text-gray-500 dark:text-gray-400">ID da Métrica</label>
                    <input
                        id={`ga-id-${integration.id}`}
                        type="text"
                        value={integration.measurementId}
                        onChange={(e) => onUpdate({ ...integration, measurementId: e.target.value })}
                        placeholder="G-XXXXXXXXXX"
                        disabled={integration.isConnected}
                        className="w-full mt-1 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md py-2 px-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 dark:disabled:bg-slate-800 disabled:text-gray-500"
                    />
                </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
                <a href="#" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">Onde encontrar o ID?</a>
                {integration.isConnected ? (
                     <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">Conectado</span>
                        </div>
                        <button onClick={handleDisconnectGa} className="py-2 px-4 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">Desconectar</button>
                    </div>
                ) : (
                    <button onClick={handleConnectGa} className="py-2 px-4 text-sm font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800">Salvar e Ativar</button>
                )}
            </div>
        </div>
    );
};

const N8nCard: React.FC<{
    integration: N8nIntegration;
    onUpdate: (integration: N8nIntegration) => void;
    onDelete: (id: string) => void;
}> = ({ integration, onUpdate, onDelete }) => {
    const handleConnectWebhook = () => {
        if (integration.webhookUrl.trim() !== '' && integration.webhookUrl.startsWith('http')) {
            onUpdate({ ...integration, isConnected: true });
        } else {
            alert("Por favor, insira uma URL de webhook válida.");
        }
    };
    
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-300 dark:border-slate-700 flex flex-col">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Conector de Automação (Webhook)</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Insira uma URL de webhook (N8N, Zapier, etc.) para permitir a criação de rascunhos.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-12 w-12 rounded bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-lg flex-shrink-0">N8N</div>
                    <button onClick={() => onDelete(integration.id)} className="text-gray-400 hover:text-red-500"><Icon type="trash" className="h-5 w-5" /></button>
                </div>
            </div>
            <div className="mt-6 flex-grow">
                <label htmlFor={`webhook-url-${integration.id}`} className="text-sm font-medium text-gray-500 dark:text-gray-400">URL do Webhook</label>
                <div className="relative mt-1">
                    <input
                        id={`webhook-url-${integration.id}`}
                        type="text"
                        value={integration.webhookUrl}
                        onChange={(e) => onUpdate({ ...integration, webhookUrl: e.target.value })}
                        placeholder="https://seu-servico.com/webhook/..."
                        disabled={integration.isConnected}
                        className="w-full bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md py-2 px-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 dark:disabled:bg-slate-800 disabled:text-gray-500"
                    />
                </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
                <a href="#" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">Ver documentação</a>
                {integration.isConnected ? (
                     <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">Conectado</span>
                        </div>
                        <button onClick={() => onUpdate({ ...integration, isConnected: false })} className="py-2 px-4 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">Desconectar</button>
                    </div>
                ) : (
                    <button onClick={handleConnectWebhook} className="py-2 px-4 text-sm font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800">Salvar e Ativar</button>
                )}
            </div>
        </div>
    );
};

const AgentApiCard: React.FC<{
    integration: AgentIntegration;
    onUpdate: (integration: AgentIntegration) => void;
    onDelete: (id: string) => void;
}> = ({ integration, onUpdate, onDelete }) => {
    const handleGenerateApiKey = () => {
        const newKey = `sk-innovateflow-${[...Array(32)].map(() => Math.random().toString(36)[2]).join('')}`;
        onUpdate({ ...integration, apiKey: newKey });
    };
    
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-300 dark:border-slate-700 flex flex-col">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API para Agentes de IA</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gere uma chave de API para permitir que um serviço externo crie e publique rascunhos de artigos.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-12 w-12 rounded bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                        <Icon type="spark" className="h-7 w-7" />
                    </div>
                    <button onClick={() => onDelete(integration.id)} className="text-gray-400 hover:text-red-500"><Icon type="trash" className="h-5 w-5" /></button>
                </div>
            </div>
            <div className="mt-6 flex-grow">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Sua Chave de API</label>
                <div className="flex items-center gap-2 mt-1">
                    <input
                        type="password"
                        value={integration.apiKey}
                        readOnly
                        placeholder="Gere uma nova chave para começar"
                        className="w-full bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md py-2 px-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={handleGenerateApiKey} className="py-2 px-4 text-sm font-semibold text-gray-800 dark:text-white bg-gray-200 dark:bg-slate-600 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500 whitespace-nowrap">
                        Gerar Nova
                    </button>
                </div>
            </div>
             <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${integration.isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className={`text-sm font-medium ${integration.isConnected ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>{integration.isConnected ? 'Conexão Ativa' : 'Inativo'}</span>
                </div>
                <button 
                    onClick={() => onUpdate({ ...integration, isConnected: !integration.isConnected })} 
                    disabled={!integration.apiKey}
                    className={`py-2 px-5 font-semibold text-white rounded-md transition-colors ${integration.isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-700 hover:bg-blue-800'} disabled:bg-gray-500 disabled:cursor-not-allowed`}
                >
                    {integration.isConnected ? 'Desconectar' : 'Conectar'}
                </button>
            </div>
        </div>
    );
};

const DatabaseCard: React.FC<{
    integration: DbIntegration;
    onUpdate: (integration: DbIntegration) => void;
    onDelete: (id: string) => void;
}> = ({ integration, onUpdate, onDelete }) => {
    const handleConnect = () => {
        // Basic validation
        if (integration.host && integration.port && integration.username && integration.databaseName) {
            onUpdate({ ...integration, isConnected: true });
        } else {
            alert("Por favor, preencha todos os campos obrigatórios.");
        }
    };

    const dbProviderOptions: DropdownOption[] = [
        { value: 'gcp', label: 'Google Cloud SQL' },
        { value: 'aws', label: 'Amazon RDS' },
        { value: 'azure', label: 'Azure SQL' },
        { value: 'other', label: 'Outro' },
    ];

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-300 dark:border-slate-700 flex flex-col">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Banco de Dados Online</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Conecte um banco de dados externo para armazenar dados da plataforma.</p>
                </div>
                 <div className="flex items-center gap-2">
                    <div className="h-12 w-12 rounded bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0">
                        <Icon type="network_intelligence" className="h-7 w-7" />
                    </div>
                    <button onClick={() => onDelete(integration.id)} className="text-gray-400 hover:text-red-500"><Icon type="trash" className="h-5 w-5" /></button>
                </div>
            </div>
            <div className="mt-6 flex-grow space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Provedor</label>
                    <Dropdown
                        options={dbProviderOptions}
                        value={integration.provider}
                        onChange={(value) => onUpdate({...integration, provider: value as DbIntegration['provider']})}
                        disabled={integration.isConnected}
                        className="mt-1"
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Host</label>
                        <input type="text" value={integration.host} onChange={e => onUpdate({...integration, host: e.target.value})} placeholder="endpoint.do.banco.de.dados" disabled={integration.isConnected} className="w-full mt-1 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md py-2 px-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 dark:disabled:bg-slate-800"/>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Porta</label>
                        <input type="text" value={integration.port} onChange={e => onUpdate({...integration, port: e.target.value})} placeholder="5432" disabled={integration.isConnected} className="w-full mt-1 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md py-2 px-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 dark:disabled:bg-slate-800"/>
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome do Banco de Dados</label>
                    <input type="text" value={integration.databaseName} onChange={e => onUpdate({...integration, databaseName: e.target.value})} placeholder="innovateflow_db" disabled={integration.isConnected} className="w-full mt-1 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md py-2 px-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 dark:disabled:bg-slate-800"/>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Usuário</label>
                        <input type="text" value={integration.username} onChange={e => onUpdate({...integration, username: e.target.value})} placeholder="admin" disabled={integration.isConnected} className="w-full mt-1 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md py-2 px-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 dark:disabled:bg-slate-800"/>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Senha</label>
                        <input type="password" placeholder="••••••••" disabled={integration.isConnected} className="w-full mt-1 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md py-2 px-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 dark:disabled:bg-slate-800"/>
                    </div>
                </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">Requer implementação de backend.</p>
                {integration.isConnected ? (
                     <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">Conectado</span>
                        </div>
                        <button onClick={() => onUpdate({ ...integration, isConnected: false })} className="py-2 px-4 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">Desconectar</button>
                    </div>
                ) : (
                    <button onClick={handleConnect} className="py-2 px-4 text-sm font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800">Salvar e Conectar</button>
                )}
            </div>
        </div>
    );
};

const WhatsAppBusinessCard: React.FC<{
    integration: WhatsAppIntegration;
    onUpdate: (integration: WhatsAppIntegration) => void;
    onDelete: (id: string) => void;
}> = ({ integration, onUpdate, onDelete }) => {

    const whatsappProviderOptions: DropdownOption[] = [
        { value: 'twilio', label: 'Twilio' },
        { value: 'zenvia', label: 'Zenvia' },
        { value: 'gupshup', label: 'Gupshup' },
        { value: 'other', label: 'Outro' },
    ];

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-300 dark:border-slate-700 flex flex-col">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">WhatsApp Business API</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Envie newsletters e notificações via API oficial do WhatsApp.</p>
                </div>
                 <div className="flex items-center gap-2">
                    <div className="h-12 w-12 rounded bg-green-100 dark:bg-green-800 flex items-center justify-center text-green-500 dark:text-green-400 flex-shrink-0">
                        <Icon type="whatsapp" className="h-7 w-7" />
                    </div>
                    <button onClick={() => onDelete(integration.id)} className="text-gray-400 hover:text-red-500"><Icon type="trash" className="h-5 w-5" /></button>
                </div>
            </div>
            <div className="mt-6 flex-grow space-y-4">
                 <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Provedor</label>
                    <Dropdown
                        options={whatsappProviderOptions}
                        value={integration.provider}
                        onChange={(value) => onUpdate({...integration, provider: value as WhatsAppIntegration['provider']})}
                        disabled={integration.isConnected}
                        className="mt-1"
                    />
                </div>
                 <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Account SID</label>
                    <input type="text" value={integration.accountSid} onChange={e => onUpdate({...integration, accountSid: e.target.value})} disabled={integration.isConnected} className="w-full mt-1 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md py-2 px-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 dark:disabled:bg-slate-800"/>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Auth Token</label>
                    <input type="password" value={integration.authToken} onChange={e => onUpdate({...integration, authToken: e.target.value})} disabled={integration.isConnected} className="w-full mt-1 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md py-2 px-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 dark:disabled:bg-slate-800"/>
                </div>
                 <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number ID</label>
                    <input type="text" value={integration.phoneNumberId} onChange={e => onUpdate({...integration, phoneNumberId: e.target.value})} disabled={integration.isConnected} className="w-full mt-1 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md py-2 px-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 dark:disabled:bg-slate-800"/>
                </div>
            </div>
             <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">Requer implementação de backend.</p>
                {integration.isConnected ? (
                     <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">Conectado</span>
                        </div>
                        <button onClick={() => onUpdate({ ...integration, isConnected: false })} className="py-2 px-4 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">Desconectar</button>
                    </div>
                ) : (
                    <button onClick={() => onUpdate({ ...integration, isConnected: true })} className="py-2 px-4 text-sm font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800">Salvar e Conectar</button>
                )}
            </div>
        </div>
    );
};

const AddIntegrationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: (type: 'ga' | 'n8n' | 'agent' | 'db' | 'whatsapp') => void;
}> = ({ isOpen, onClose, onAdd }) => {
    if (!isOpen) return null;

    const integrationOptions = [
        { type: 'ga' as const, name: 'Google Analytics', description: 'Obtenha insights sobre o tráfego do seu site.', icon: 'google' as const },
        { type: 'whatsapp' as const, name: 'WhatsApp Business API', description: 'Envie newsletters e notificações via WhatsApp.', icon: 'whatsapp' as const },
        { type: 'n8n' as const, name: 'Webhook (N8N, Zapier, etc.)', description: 'Permita que ferramentas externas criem rascunhos.', icon: 'bolt' as const },
        { type: 'agent' as const, name: 'API para Agentes de IA', description: 'Gere uma chave de API para dar acesso programático.', icon: 'spark' as const },
        { type: 'db' as const, name: 'Banco de Dados Online', description: 'Conecte um banco de dados externo (GCP, AWS, etc).', icon: 'network_intelligence' as const },
    ];

    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex justify-center items-center p-4 backdrop-blur-sm" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-lg border border-gray-300 dark:border-slate-700 shadow-xl flex flex-col max-h-[90vh]">
                <header className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-slate-600 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Adicionar Nova Integração</h3>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
                        <Icon type="close" className="h-6 w-6" />
                    </button>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {integrationOptions.map(opt => (
                            <div key={opt.type} className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-md border border-gray-300 dark:border-slate-600 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <Icon type={opt.icon} className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                                        <h4 className="font-semibold text-gray-900 dark:text-white">{opt.name}</h4>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{opt.description}</p>
                                </div>
                                <button
                                    onClick={() => onAdd(opt.type)}
                                    className="mt-4 w-full text-center py-2 px-4 text-sm font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Icon type="plus" className="w-4 h-4" />
                                    Adicionar
                                </button>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

const IntegrationsView: React.FC = () => {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [isAddModalOpen, setAddModalOpen] = useState(false);

    useEffect(() => {
        try {
            const savedIntegrations = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedIntegrations) {
                setIntegrations(JSON.parse(savedIntegrations));
            } else {
                setIntegrations([
                    { id: 'ga_1', type: 'ga', name: 'InnovateFlow Principal', measurementId: '', isConnected: false },
                ]);
            }
        } catch (error) {
            console.error("Failed to load integrations from localStorage", error);
            setIntegrations([
                 { id: 'ga_1', type: 'ga', name: 'InnovateFlow Principal', measurementId: '', isConnected: false },
            ]);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(integrations));
        } catch (error) {
            console.error("Failed to save integrations to localStorage", error);
        }
    }, [integrations]);

    const handleUpdateIntegration = (updated: Integration) => {
        setIntegrations(prev => prev.map(i => i.id === updated.id ? updated : i));
    };

    const handleAddIntegration = (type: Integration['type']) => {
        let newIntegration: Integration;
        const id = `${type}_${Date.now()}`;
        switch(type) {
            case 'ga':
                newIntegration = { id, type, name: '', measurementId: '', isConnected: false };
                break;
            case 'n8n':
                newIntegration = { id, type, webhookUrl: '', isConnected: false };
                break;
            case 'db':
                newIntegration = { id, type, provider: 'gcp', host: '', port: '', username: '', databaseName: '', isConnected: false };
                break;
            case 'whatsapp':
                newIntegration = { id, type, provider: 'twilio', accountSid: '', authToken: '', phoneNumberId: '', isConnected: false };
                break;
            case 'agent':
                newIntegration = { id, type, apiKey: '', isConnected: false };
                break;
        }
        
        setIntegrations(prev => [...prev, newIntegration]);
        setAddModalOpen(false);
    };

    const handleDeleteIntegration = (id: string) => {
        setIntegrations(prev => prev.filter(i => i.id !== id));
    };
    
    return (
        <>
            <div className="space-y-8">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Integrações e APIs</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Conecte o InnovateFlow com suas ferramentas ou gere chaves de API para acesso externo.</p>
                    </div>
                    <button 
                        onClick={() => setAddModalOpen(true)}
                        className="py-2.5 px-5 w-full sm:w-auto font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <Icon type="plus" className="w-5 h-5" />
                        Adicionar Integração
                    </button>
                </header>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {integrations.map((integration) => {
                        switch (integration.type) {
                            case 'ga':
                                return <GoogleAnalyticsCard key={integration.id} integration={integration} onUpdate={handleUpdateIntegration as (i: GaIntegration) => void} onDelete={handleDeleteIntegration} />;
                            case 'n8n':
                                return <N8nCard key={integration.id} integration={integration} onUpdate={handleUpdateIntegration as (i: N8nIntegration) => void} onDelete={handleDeleteIntegration} />;
                            case 'agent':
                                return <AgentApiCard key={integration.id} integration={integration} onUpdate={handleUpdateIntegration as (i: AgentIntegration) => void} onDelete={handleDeleteIntegration} />;
                            case 'db':
                                return <DatabaseCard key={integration.id} integration={integration} onUpdate={handleUpdateIntegration as (i: DbIntegration) => void} onDelete={handleDeleteIntegration} />;
                            case 'whatsapp':
                                return <WhatsAppBusinessCard key={integration.id} integration={integration} onUpdate={handleUpdateIntegration as (i: WhatsAppIntegration) => void} onDelete={handleDeleteIntegration} />;
                            default:
                                return null;
                        }
                    })}
                </div>
            </div>

            <AddIntegrationModal
                isOpen={isAddModalOpen}
                onClose={() => setAddModalOpen(false)}
                onAdd={handleAddIntegration}
            />
        </>
    );
};

export default IntegrationsView;