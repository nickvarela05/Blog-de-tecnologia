import React, { useState, useRef } from 'react';
import Icon from './Icon';
import ImageCropperModal from './ImageCropperModal';
// FIX: AutomationSettings is in types.ts, not App.tsx. AllInfoContents is in App.tsx.
import type { AllInfoContents } from '../App';
import type { AutomationSettings } from '../types';
import Dropdown, { DropdownOption } from './Dropdown';

const SettingsRow: React.FC<{ title: string; description: string; children: React.ReactNode; isLast?: boolean }> = ({ title, description, children, isLast }) => (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between py-6 ${!isLast ? 'border-b border-gray-300 dark:border-slate-700' : ''}`}>
        <div>
            <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{description}</p>
        </div>
        <div className="mt-4 sm:mt-0 flex-shrink-0">
            {children}
        </div>
    </div>
);

const ToggleSwitch: React.FC<{ enabled: boolean; setEnabled: (enabled: boolean) => void }> = ({ enabled, setEnabled }) => (
    <button
        onClick={() => setEnabled(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-blue-700' : 'bg-gray-400 dark:bg-slate-600'}`}
        aria-checked={enabled}
        role="switch"
    >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

interface SettingsViewProps {
    footerInfoContents: AllInfoContents;
    setFooterInfoContents: React.Dispatch<React.SetStateAction<AllInfoContents>>;
    automationSettings: AutomationSettings;
    setAutomationSettings: React.Dispatch<React.SetStateAction<AutomationSettings>>;
}


const SettingsView: React.FC<SettingsViewProps> = ({ footerInfoContents, setFooterInfoContents, automationSettings, setAutomationSettings }) => {
    const [name, setName] = useState('Alex Grayson');
    const [email, setEmail] = useState('alex.grayson@innovateflow.com');
    const [phone, setPhone] = useState('(11) 98765-4321');
    const [language, setLanguage] = useState('portugues');
    const [showLanguageConfirmation, setShowLanguageConfirmation] = useState(false);

    const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
    const [emailNotifications, setEmailNotifications] = useState({
        weeklyDigest: false,
        comments: true,
    });
    const [pushNotifications, setPushNotifications] = useState({
        newArticles: false,
        comments: true,
    });
     const [whatsappNotifications, setWhatsappNotifications] = useState({
        newArticles: true,
        weeklyDigest: false,
    });


    const [profilePicture, setProfilePicture] = useState('https://picsum.photos/id/433/100/100');
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // State for Footer Content Editor
    const [editableFooterInfo, setEditableFooterInfo] = useState<AllInfoContents>(footerInfoContents);
    const [openAccordion, setOpenAccordion] = useState<keyof AllInfoContents | null>(null);
    const [showFooterSaveConfirmation, setShowFooterSaveConfirmation] = useState(false);

    // State for Content Automation
    const [showCustomSchedules, setShowCustomSchedules] = useState(false);
    const [showAutomationSaveConfirmation, setShowAutomationSaveConfirmation] = useState(false);

    const adminEmail = 'alex.grayson@innovateflow.com';

    const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

    const formatPhoneNumber = (value: string): string => {
        if (!value) return value;
        const phoneNumber = value.replace(/[^\d]/g, '');
        const phoneNumberLength = phoneNumber.length;
        if (phoneNumberLength < 3) return `(${phoneNumber}`;
        if (phoneNumberLength < 8) return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
        return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedPhoneNumber = formatPhoneNumber(e.target.value);
        setPhone(formattedPhoneNumber);
    };


    const handlePictureEditClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setOriginalImage(reader.result as string);
                setIsCropperOpen(true);
            };
            reader.readAsDataURL(file);
        }
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleCrop = (croppedImageUrl: string) => {
        setProfilePicture(croppedImageUrl);
        setIsCropperOpen(false);
        setOriginalImage(null);
    };

    const handleChangePasswordSubmit = () => {
        if (newPassword !== confirmPassword) {
            alert("A nova senha e a confirmação não correspondem.");
            return;
        }
        if (newPassword.length < 8) {
            alert("A nova senha deve ter pelo menos 8 caracteres.");
            return;
        }
        // Mock success
        console.log("Senha alterada com sucesso (mock).");
        alert("Senha alterada com sucesso!");
        setIsChangePasswordModalOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };
    
    const handleLanguageChange = (value: string) => {
        setLanguage(value);
        setShowLanguageConfirmation(true);
        setTimeout(() => {
            setShowLanguageConfirmation(false);
        }, 3000);
    };

    const handleSaveNotifications = () => {
        console.log('Notification settings saved:', { emailNotifications, pushNotifications, whatsappNotifications });
        setIsNotificationsModalOpen(false);
    };
    
    const handleFooterContentChange = (section: keyof AllInfoContents, content: string) => {
        setEditableFooterInfo(prev => ({
            ...prev,
            [section]: { ...prev[section], content }
        }));
    };
    
    const handleSaveFolderContent = () => {
        setFooterInfoContents(editableFooterInfo);
        setShowFooterSaveConfirmation(true);
        setTimeout(() => {
            setShowFooterSaveConfirmation(false);
        }, 3000);
    };
    
    const toggleAccordion = (section: keyof AllInfoContents) => {
        setOpenAccordion(openAccordion === section ? null : section);
    };

    const handleToggleDay = (day: string) => {
        setAutomationSettings(prev => ({
            ...prev,
            postingDays: prev.postingDays.includes(day)
                ? prev.postingDays.filter(d => d !== day)
                : [...prev.postingDays, day],
        }));
    };
    
    const handleTimeChange = (index: number, value: string) => {
        const newTimes = [...automationSettings.postingTimes];
        newTimes[index] = value;
        setAutomationSettings(prev => ({ ...prev, postingTimes: newTimes }));
    };

    const handleAddTime = () => {
        setAutomationSettings(prev => ({ ...prev, postingTimes: [...prev.postingTimes, ''] }));
    };

    const handleRemoveTime = (index: number) => {
        setAutomationSettings(prev => ({
            ...prev,
            postingTimes: prev.postingTimes.filter((_, i) => i !== index),
        }));
    };
    
    const handleCustomTimeChange = (day: string, index: number, value: string) => {
        const daySchedule = automationSettings.customDaySchedules[day] || [];
        const newTimes = [...daySchedule];
        newTimes[index] = value;
        setAutomationSettings(prev => ({
            ...prev,
            customDaySchedules: { ...prev.customDaySchedules, [day]: newTimes },
        }));
    };
    
    const handleAddCustomTime = (day: string) => {
        const daySchedule = automationSettings.customDaySchedules[day] || [];
        setAutomationSettings(prev => ({
            ...prev,
            customDaySchedules: { ...prev.customDaySchedules, [day]: [...daySchedule, ''] },
        }));
    };
    
    const handleRemoveCustomTime = (day: string, index: number) => {
        const daySchedule = automationSettings.customDaySchedules[day] || [];
        setAutomationSettings(prev => ({
            ...prev,
            customDaySchedules: { ...prev.customDaySchedules, [day]: daySchedule.filter((_, i) => i !== index) },
        }));
    };

    const handleSaveAutomationSettings = () => {
        // The state is already updated via setAutomationSettings. 
        // This button just provides user feedback since the useEffect in App.tsx handles the actual saving.
        setShowAutomationSaveConfirmation(true);
        setTimeout(() => {
            setShowAutomationSaveConfirmation(false);
        }, 3000);
    };


    const languageOptions: DropdownOption[] = [
        { value: 'portugues', label: 'Português' },
        { value: 'english', label: 'English' },
        { value: 'spanish', label: 'Español' },
    ];

    return (
        <>
            <div className="space-y-8 max-w-5xl mx-auto">
                 {/* Profile Header */}
                <div className="flex items-center space-x-6 p-6 bg-white dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-slate-700">
                    <div className="relative">
                        <img src={profilePicture} alt="Alex Grayson" className="h-24 w-24 rounded-full object-cover border-2 border-gray-200 dark:border-slate-600" />
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                            aria-hidden="true"
                        />
                        <button onClick={handlePictureEditClick} className="absolute bottom-0 right-0 bg-blue-700 h-8 w-8 rounded-full flex items-center justify-center text-white hover:bg-blue-800 border-2 border-white dark:border-slate-800" aria-label="Change profile picture">
                            <Icon type="pencil" className="h-4 w-4" />
                        </button>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{name}</h1>
                        <p className="text-gray-500 dark:text-gray-400">{email}</p>
                    </div>
                </div>

                {/* Profile Details Card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-300 dark:border-slate-700">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="name-input" className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome</label>
                            <input id="name-input" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="email-input" className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                            <input id="email-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                         <div>
                            <label htmlFor="phone-input" className="text-sm font-medium text-gray-500 dark:text-gray-400">Telefone</label>
                            <input id="phone-input" type="tel" value={phone} onChange={handlePhoneChange} maxLength={15} className="w-full p-2 mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div className="flex justify-end mt-6">
                        <button className="py-2 px-5 font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800">Salvar Alterações</button>
                    </div>
                </div>

                {/* Security Card */}
                 <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-slate-700">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Segurança</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie sua senha e métodos de autenticação.</p>
                    </div>
                    <div className="px-6">
                        <SettingsRow title="Senha" description="Última alteração em 12 de Jan de 2024">
                            <button onClick={() => setIsChangePasswordModalOpen(true)} className="py-2 px-4 text-sm font-semibold text-gray-800 dark:text-white bg-gray-200 dark:bg-slate-600 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500">Alterar Senha</button>
                        </SettingsRow>
                         <div className="py-6">
                            <h3 className="font-medium text-gray-900 dark:text-white mb-1">Atividade de Login Recente</h3>
                            <div className="mt-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Icon type="desktop" className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">Chrome no Windows 11</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-500">Nova York, EUA - há 2 horas</p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">Ativo Agora</span>
                                </div>
                                <div className="flex items-center justify-between">
                                     <div className="flex items-center gap-4">
                                        <Icon type="mobile" className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">App InnovateFlow no iOS</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-500">Nova York, EUA - há 1 dia</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preferences Card */}
                 <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-slate-700">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Preferências</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Personalize a aplicação ao seu gosto.</p>
                    </div>
                    <div className="px-6">
                        <SettingsRow title="Notificações" description="Gerencie suas notificações por e-mail e push.">
                            <button onClick={() => setIsNotificationsModalOpen(true)} className="py-2 px-4 text-sm font-semibold text-gray-800 dark:text-white bg-gray-200 dark:bg-slate-600 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500">Gerenciar</button>
                        </SettingsRow>
                        <SettingsRow title="Idioma" description="Defina seu idioma de preferência para a interface." isLast={true}>
                           <div className="flex items-center gap-4">
                                {showLanguageConfirmation && <span className="text-sm text-green-600 dark:text-green-400 transition-opacity duration-300">Salvo!</span>}
                                <Dropdown
                                    options={languageOptions}
                                    value={language}
                                    onChange={handleLanguageChange}
                                    className="w-full sm:w-36"
                                />
                            </div>
                        </SettingsRow>
                    </div>
                </div>

                 {/* Content Automation Card */}
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-slate-700">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Automação de Conteúdo</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie a criação e postagem automática de artigos.</p>
                    </div>
                    <div className="px-6">
                        <SettingsRow title="Postagem Automática de Artigos" description="Ative para permitir que a IA gere e publique artigos com base em tópicos em alta.">
                            <ToggleSwitch enabled={automationSettings.autoPostEnabled} setEnabled={(val) => setAutomationSettings(prev => ({ ...prev, autoPostEnabled: val }))} />
                        </SettingsRow>

                        {automationSettings.autoPostEnabled && (
                            <div className="py-6 space-y-6">
                                {/* Dias de Postagem */}
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">Dias de Postagem</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Selecione os dias da semana para as postagens automáticas.</p>
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {weekdays.map(day => (
                                            <button 
                                                key={day}
                                                onClick={() => handleToggleDay(day)}
                                                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                                                    automationSettings.postingDays.includes(day)
                                                        ? 'bg-blue-700 text-white'
                                                        : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600'
                                                }`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Horários de Postagem */}
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">Horários de Postagem Padrão</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Adicione os horários para as postagens nos dias selecionados.</p>
                                    <div className="space-y-2 mt-4 max-w-sm">
                                        {automationSettings.postingTimes.map((time, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <input
                                                    type="time"
                                                    value={time}
                                                    onChange={(e) => handleTimeChange(index, e.target.value)}
                                                    className="w-full p-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                {automationSettings.postingTimes.length > 1 && (
                                                    <button onClick={() => handleRemoveTime(index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full">
                                                        <Icon type="trash" className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={handleAddTime} className="mt-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                                        <Icon type="plus" className="w-4 h-4" /> Adicionar Horário
                                    </button>
                                </div>
                                
                                {/* Personalização de Horários */}
                                <div className="pt-6 border-t border-gray-300 dark:border-slate-700">
                                    <button onClick={() => setShowCustomSchedules(!showCustomSchedules)} className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                        Personalizar horários por dia <Icon type="chevron-down" className={`w-5 h-5 transition-transform ${showCustomSchedules ? 'rotate-180' : ''}`} />
                                    </button>
                                    {showCustomSchedules && (
                                        <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-200 dark:border-slate-600">
                                            {automationSettings.postingDays.length > 0 ? automationSettings.postingDays.map(day => (
                                                <div key={day}>
                                                     <h4 className="font-semibold text-gray-800 dark:text-gray-200">{day}</h4>
                                                     <div className="space-y-2 mt-2 max-w-sm">
                                                        {(automationSettings.customDaySchedules[day] || []).map((time, index) => (
                                                            <div key={index} className="flex items-center gap-2">
                                                                <input
                                                                    type="time"
                                                                    value={time}
                                                                    onChange={(e) => handleCustomTimeChange(day, index, e.target.value)}
                                                                    className="w-full p-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md"
                                                                />
                                                                <button onClick={() => handleRemoveCustomTime(day, index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full">
                                                                    <Icon type="trash" className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                     </div>
                                                     <button onClick={() => handleAddCustomTime(day)} className="mt-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                                                        <Icon type="plus" className="w-4 h-4" /> Adicionar Horário para {day}
                                                    </button>
                                                </div>
                                            )) : <p className="text-sm text-gray-500 dark:text-gray-400">Selecione pelo menos um dia de postagem para personalizar.</p>}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end items-center gap-4 mt-6 pt-6 border-t border-gray-300 dark:border-slate-700">
                                    {showAutomationSaveConfirmation && <span className="text-sm text-green-600 dark:text-green-400 transition-opacity duration-300">Salvo com sucesso!</span>}
                                    <button onClick={handleSaveAutomationSettings} className="py-2 px-5 font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800">Salvar Configurações de Automação</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>


                {/* Footer Content Editor Card */}
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-slate-700">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Conteúdo do Rodapé</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Edite as informações exibidas nos links do rodapé do site.</p>
                    </div>
                    <div className="border-t border-gray-200 dark:border-slate-700">
                        {(Object.keys(editableFooterInfo) as Array<keyof AllInfoContents>).map((key) => (
                            <div key={key} className="border-b border-gray-200 dark:border-slate-700 last:border-b-0">
                                <button onClick={() => toggleAccordion(key)} className="w-full flex justify-between items-center p-4 text-left font-medium text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <span>{editableFooterInfo[key].title}</span>
                                    <Icon type="chevron-down" className={`w-5 h-5 transition-transform ${openAccordion === key ? 'rotate-180' : ''}`} />
                                </button>
                                {openAccordion === key && (
                                    <div className="p-4 bg-gray-50 dark:bg-slate-900/50">
                                        <label htmlFor={`${key}-content`} className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Conteúdo (suporta HTML)
                                            {key === 'contact' && <span className="text-xs"> - Use `{'{{adminEmail}}'}` para inserir o e-mail do admin ({adminEmail}).</span>}
                                        </label>
                                        <textarea
                                            id={`${key}-content`}
                                            value={editableFooterInfo[key].content}
                                            onChange={(e) => handleFooterContentChange(key, e.target.value)}
                                            rows={10}
                                            className="w-full p-2 mt-1 text-gray-900 dark:text-white bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <footer className="p-4 flex justify-end items-center gap-4">
                        {showFooterSaveConfirmation && <span className="text-sm text-green-600 dark:text-green-400 transition-opacity duration-300">Alterações salvas com sucesso!</span>}
                        <button onClick={handleSaveFolderContent} className="py-2 px-5 font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800">
                            Salvar Conteúdo do Rodapé
                        </button>
                    </footer>
                </div>

            </div>
             {isCropperOpen && originalImage && (
                <ImageCropperModal
                    imageSrc={originalImage}
                    onClose={() => setIsCropperOpen(false)}
                    onCrop={handleCrop}
                />
            )}
             {isChangePasswordModalOpen && (
                <div className="fixed inset-0 bg-black/80 z-[60] flex justify-center items-center p-4 backdrop-blur-sm" aria-modal="true" role="dialog">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-lg border border-gray-300 dark:border-slate-700 shadow-xl flex flex-col">
                        <header className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-slate-600">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Alterar Senha</h3>
                        <button onClick={() => setIsChangePasswordModalOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
                            <Icon type="close" className="h-6 w-6" />
                        </button>
                        </header>
                        <main className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Senha Atual</label>
                                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full p-2 mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nova Senha</label>
                                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-2 mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Confirmar Nova Senha</label>
                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-2 mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </main>
                        <footer className="p-4 border-t border-gray-300 dark:border-slate-600 flex justify-end gap-4">
                            <button onClick={() => setIsChangePasswordModalOpen(false)} className="py-2 px-5 font-semibold text-gray-800 dark:text-gray-300 bg-gray-200 dark:bg-slate-600 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500">Cancelar</button>
                            <button onClick={handleChangePasswordSubmit} className="py-2 px-5 font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800">Salvar Alterações</button>
                        </footer>
                    </div>
                </div>
            )}
            {isNotificationsModalOpen && (
                 <div className="fixed inset-0 bg-black/80 z-[60] flex justify-center items-center p-4 backdrop-blur-sm" aria-modal="true" role="dialog">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-lg border border-gray-300 dark:border-slate-700 shadow-xl flex flex-col">
                        <header className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-slate-600">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gerenciar Notificações</h3>
                            <button onClick={() => setIsNotificationsModalOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
                                <Icon type="close" className="h-6 w-6" />
                            </button>
                        </header>
                        <main className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">Notificações por E-mail</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Receba e-mails para se manter atualizado.</p>
                                <div className="mt-4 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200">Resumos semanais</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Receba um resumo de performance semanal no seu e-mail.</p>
                                        </div>
                                        <ToggleSwitch enabled={emailNotifications.weeklyDigest} setEnabled={(val) => setEmailNotifications(p => ({...p, weeklyDigest: val}))} />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200">Comentários e menções</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Seja notificado sobre respostas aos seus comentários.</p>
                                        </div>
                                        <ToggleSwitch enabled={emailNotifications.comments} setEnabled={(val) => setEmailNotifications(p => ({...p, comments: val}))} />
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 dark:border-slate-700"></div>
                             <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">Notificações por WhatsApp</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Receba mensagens para os eventos mais importantes.</p>
                                <div className="mt-4 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200">Novos artigos publicados</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Receba uma notificação quando um artigo da IA for publicado.</p>
                                        </div>
                                        <ToggleSwitch enabled={whatsappNotifications.newArticles} setEnabled={(val) => setWhatsappNotifications(p => ({...p, newArticles: val}))} />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200">Resumos semanais</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Receba um resumo de performance no seu WhatsApp.</p>
                                        </div>
                                        <ToggleSwitch enabled={whatsappNotifications.weeklyDigest} setEnabled={(val) => setWhatsappNotifications(p => ({...p, weeklyDigest: val}))} />
                                    </div>
                                </div>
                            </div>
                             <div className="border-t border-gray-200 dark:border-slate-700"></div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">Notificações Push</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Receba notificações diretamente no seu dispositivo.</p>
                                <div className="mt-4 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200">Novos artigos publicados</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Receba uma notificação push quando um novo artigo for publicado.</p>
                                        </div>
                                        <ToggleSwitch enabled={pushNotifications.newArticles} setEnabled={(val) => setPushNotifications(p => ({...p, newArticles: val}))} />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200">Comentários e menções</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Receba notificações push para interações sociais.</p>
                                        </div>
                                        <ToggleSwitch enabled={pushNotifications.comments} setEnabled={(val) => setPushNotifications(p => ({...p, comments: val}))} />
                                    </div>
                                </div>
                            </div>
                        </main>
                        <footer className="p-4 border-t border-gray-300 dark:border-slate-600 flex justify-end gap-4">
                            <button onClick={() => setIsNotificationsModalOpen(false)} className="py-2 px-5 font-semibold text-gray-800 dark:text-gray-300 bg-gray-200 dark:bg-slate-600 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500">Cancelar</button>
                            <button onClick={handleSaveNotifications} className="py-2 px-5 font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800">Salvar Preferências</button>
                        </footer>
                    </div>
                </div>
            )}
        </>
    );
};

export default SettingsView;