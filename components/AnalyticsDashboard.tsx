import React, { useState, useRef, useEffect, useCallback } from 'react';
import Icon from './Icon';
import { KpiData } from '../types';
import AddWidgetModal from './AddWidgetModal';
import DatePicker from './DatePicker';

interface AnalyticsDashboardProps {
    totalVisitors: number;
    emailLeads: number;
    whatsappLeads: number;
}

// Stub interface to check for GA connection without importing from another component
interface GaIntegrationStub {
  type: 'ga';
  isConnected: boolean;
}

const KpiCard: React.FC<{ data: KpiData }> = ({ data }) => {
  const { title, value, change, isPositive } = data;
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-300 dark:border-slate-700">
      <h3 className="text-sm text-gray-500 dark:text-gray-400">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
      <div className={`flex items-center text-sm mt-2 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        <Icon type={isPositive ? 'arrow-up' : 'arrow-down'} className="h-5 w-5 mr-1" />
        <span>{change}</span>
      </div>
    </div>
  );
};

const ChartCard: React.FC<{ title: string; children: React.ReactNode; onDelete?: () => void }> = ({ title, children, onDelete }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-300 dark:border-slate-700 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white">{title}</h3>
                {onDelete && (
                     <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setIsDropdownOpen(p => !p)} className="text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-white">
                            <Icon type="dots-vertical" className="h-5 w-5" />
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md shadow-lg z-10">
                            <button
                                onClick={() => {
                                    onDelete();
                                    setIsDropdownOpen(false);
                                }}
                                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors"
                            >
                                <Icon type="trash" className="w-4 h-4" />
                                Excluir Widget
                            </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="flex-grow">{children}</div>
        </div>
    );
};

// --- WIDGET COMPONENTS ---

const UserActivityWidget = ({ onDelete }: { onDelete?: () => void }) => (
    <ChartCard title="Atividade de Usuários (Últimos 30 dias)" onDelete={onDelete}>
        <div className="h-72 flex items-end p-4 bg-gray-100 dark:bg-slate-900/20 rounded-md">
            <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="none" className="text-gray-300 dark:text-slate-700">
                <line x1="0" y1="150" x2="300" y2="150" stroke="currentColor" strokeWidth="1"/>
                <line x1="0" y1="0" x2="0" y2="150" stroke="currentColor" strokeWidth="1"/>
                <polyline points="0,100 75,50 150,75 225,40 300,60" fill="none" stroke="#3B82F6" strokeWidth="2"/>
            </svg>
        </div>
    </ChartCard>
);

const TrafficSourceWidget = ({ onDelete }: { onDelete?: () => void }) => {
    const sources = [
        { name: 'Busca Orgânica', value: '45%', color: '#3B82F6' },
        { name: 'Direto', value: '25%', color: '#8B5CF6' },
        { name: 'Referência', value: '15%', color: '#10B981' },
        { name: 'Social', value: '15%', color: '#FBBF24' },
    ];
    return (
        <ChartCard title="Fontes de Tráfego" onDelete={onDelete}>
             <div className="h-full bg-gray-100 dark:bg-slate-900/20 rounded-md p-4 space-y-4">
                {sources.map(source => (
                    <div key={source.name}>
                        <div className="flex justify-between items-center text-sm mb-1">
                            <span className="text-gray-700 dark:text-gray-300">{source.name}</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{source.value}</span>
                        </div>
                        <div className="w-full bg-gray-300 dark:bg-slate-700 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full" style={{ width: source.value, backgroundColor: source.color }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </ChartCard>
    );
};

const GeographicBreakdownWidget = ({ onDelete }: { onDelete: () => void }) => {
    const geoData = [
        { country: 'Brasil', percentage: 65, color: '#10B981' },
        { country: 'Estados Unidos', percentage: 15, color: '#3B82F6' },
        { country: 'Portugal', percentage: 12, color: '#EF4444' },
        { country: 'Outros', percentage: 8, color: '#FBBF24' },
    ];
    return (
        <ChartCard title="Análise Geográfica" onDelete={onDelete}>
            <div className="h-full bg-gray-100 dark:bg-slate-900/20 rounded-md p-4 space-y-4">
                {geoData.map(data => (
                    <div key={data.country}>
                        <div className="flex justify-between items-center text-sm mb-1">
                            <span className="text-gray-700 dark:text-gray-300">{data.country}</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{data.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-300 dark:bg-slate-700 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full" style={{ width: `${data.percentage}%`, backgroundColor: data.color }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </ChartCard>
    );
};
const TrafficByDeviceWidget = ({ onDelete }: { onDelete: () => void }) => (
    <ChartCard title="Tráfego por Dispositivo" onDelete={onDelete}>
        <div className="h-72 flex flex-col items-center justify-center bg-gray-100 dark:bg-slate-900/20 rounded-md p-4">
            <svg width="120" height="120" viewBox="0 0 36 36" className="transform -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#EC4899" strokeWidth="3.8" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3B82F6" strokeWidth="3.8" strokeDasharray="65, 100" />
            </svg>
            <div className="flex justify-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span>Desktop</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-pink-500"></div><span>Móvel</span></div>
            </div>
        </div>
    </ChartCard>
);

type WidgetDefinition = {
    id: string;
    name: string;
    description: string;
    icon: React.ComponentProps<typeof Icon>['type'];
    component: React.FC<{ onDelete: () => void }>;
};

const availableGaWidgets: WidgetDefinition[] = [
    { id: 'geo-breakdown', name: 'Análise Geográfica', description: 'Visualize de onde vêm os visitantes do seu site.', icon: 'network_intelligence' as const, component: GeographicBreakdownWidget },
    { id: 'traffic-by-device', name: 'Tráfego por Dispositivo', description: 'Divida o tráfego entre desktop e dispositivos móveis.', icon: 'mobile' as const, component: TrafficByDeviceWidget },
    // Add other potential GA widgets here
];


const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ totalVisitors, emailLeads, whatsappLeads }) => {
    const [isGaConnected, setIsGaConnected] = useState(false);
    const [activeFilter, setActiveFilter] = useState('Todas as Aplicações');
    const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
        start: new Date(new Date().setDate(new Date().getDate() - 30)),
        end: new Date(),
    });
    const [dashboardWidgets, setDashboardWidgets] = useState<WidgetDefinition[]>([]);
    
    useEffect(() => {
        const savedIntegrationsRaw = localStorage.getItem('innovateFlowIntegrations');
        if (savedIntegrationsRaw) {
            try {
                const savedIntegrations: (GaIntegrationStub | { type: string })[] = JSON.parse(savedIntegrationsRaw);
                const isAnyGaConnected = savedIntegrations.some(
                    i => i.type === 'ga' && (i as GaIntegrationStub).isConnected
                );
                setIsGaConnected(isAnyGaConnected);
            } catch (e) {
                console.error("Error parsing integrations from localStorage", e);
                setIsGaConnected(false);
            }
        } else {
            setIsGaConnected(false);
        }
    }, []);

    const gaKpiData: KpiData[] = [
        { title: 'Usuários', value: '7.832', change: '12.5%', isPositive: true },
        { title: 'Sessões', value: '10.291', change: '9.8%', isPositive: true },
        { title: 'Taxa de Rejeição', value: '45.2%', change: '2.1%', isPositive: false },
        { title: 'Duração Média da Sessão', value: '2m 45s', change: '3.7%', isPositive: true },
    ];
    
    const internalKpiData: KpiData[] = [
        { title: 'Visitantes Totais', value: totalVisitors.toLocaleString('pt-BR'), change: '5.2%', isPositive: true },
        { title: 'Leads (E-mail)', value: emailLeads.toLocaleString('pt-BR'), change: '12.1%', isPositive: true },
        { title: 'Leads (WhatsApp)', value: whatsappLeads.toLocaleString('pt-BR'), change: '8.3%', isPositive: true },
        { title: 'Taxa de Conversão', value: `${(totalVisitors > 0 ? ((emailLeads + whatsappLeads) / totalVisitors) * 100 : 0).toFixed(2)}%`, change: '0.8%', isPositive: true },
    ];

    const filters = ['Todas as Aplicações', 'InnovateFlow', 'Páginas de Vendas', 'Landing Pages', 'Blogs Secundários'];

    const handleDeleteWidget = (id: string) => {
        setDashboardWidgets(prev => prev.filter(w => w.id !== id));
    };

    const handleAddWidget = (widgetId: string) => {
        if (dashboardWidgets.some(w => w.id === widgetId)) {
             alert("Este widget já está no seu painel.");
             return;
        }
        const widgetToAdd = availableGaWidgets.find(w => w.id === widgetId);
        if (widgetToAdd) {
            setDashboardWidgets(prevWidgets => [...prevWidgets, widgetToAdd]);
        }
        setIsAddWidgetModalOpen(false);
    };

    const handleApplyDateRange = (start: Date, end: Date) => {
        setDateRange({ start, end });
        setIsDatePickerOpen(false);
    };

    const formatDateRange = (start: Date, end: Date) => {
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
        return `${start.toLocaleDateString('pt-BR', options)} - ${end.toLocaleDateString('pt-BR', options)}`;
    };

    if (!isGaConnected) {
        return (
            <div className="space-y-8">
                <header>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Painel de Análises</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Uma visão abrangente das métricas de desempenho do InnovateFlow.</p>
                </header>
                <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-700">
                    <Icon type="google" className="h-12 w-12 mx-auto text-gray-400"/>
                    <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Conecte o Google Analytics</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Obtenha insights detalhados sobre seus visitantes integrando sua conta do Google Analytics.</p>
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Vá para a aba <strong className="text-gray-700 dark:text-gray-300">Integrações</strong> para começar.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {internalKpiData.map(kpi => <KpiCard key={kpi.title} data={kpi} />)}
                </div>
            </div>
        );
    }
    
    return (
        <>
            <div className="space-y-8">
                {/* Header */}
                <header>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Painel de Análises</h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Dados fornecidos pela integração com o Google Analytics.</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                            <div className="relative">
                                <button 
                                    onClick={() => setIsDatePickerOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors w-full sm:w-auto"
                                >
                                    <Icon type="calendar" className="h-4 w-4" />
                                    <span>{formatDateRange(dateRange.start, dateRange.end)}</span>
                                    <Icon type="chevron-down" className="h-4 w-4" />
                                </button>
                                {isDatePickerOpen && (
                                    <DatePicker
                                        initialStartDate={dateRange.start}
                                        initialEndDate={dateRange.end}
                                        onClose={() => setIsDatePickerOpen(false)}
                                        onApply={handleApplyDateRange}
                                    />
                                )}
                             </div>
                            <button 
                                onClick={() => setIsAddWidgetModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-700 border border-blue-500 rounded-md text-sm text-white font-semibold hover:bg-blue-800"
                            >
                                <Icon type="plus" className="h-4 w-4" />
                                <span>Adicionar Widget</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                    {filters.map(filter => (
                        <button 
                            key={filter} 
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                activeFilter === filter 
                                    ? 'bg-blue-700 text-white' 
                                    : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {gaKpiData.map(kpi => <KpiCard key={kpi.title} data={kpi} />)}
                </div>

                {/* Chart Widgets */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="lg:col-span-2">
                        <UserActivityWidget />
                    </div>
                    <div className="lg:col-span-1">
                       <TrafficSourceWidget />
                   </div>
                   
                   {/* Dynamically Added Widgets */}
                   {dashboardWidgets.map((widget) => {
                      const WidgetComponent = widget.component;
                      return <div key={widget.id} className="lg:col-span-1"><WidgetComponent onDelete={() => handleDeleteWidget(widget.id)} /></div>;
                   })}
                </div>
            </div>
            <AddWidgetModal 
                isOpen={isAddWidgetModalOpen}
                onClose={() => setIsAddWidgetModalOpen(false)}
                onAddWidget={handleAddWidget}
                availableWidgets={availableGaWidgets}
            />
        </>
    );
};

export default AnalyticsDashboard;
