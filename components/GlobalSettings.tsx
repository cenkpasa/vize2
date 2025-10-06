
import React from 'react';
import { AgentModel } from '../types';

interface GlobalSettingsProps {
    agentModel: AgentModel;
    setAgentModel: (model: AgentModel) => void;
    pollInterval: number;
    setPollInterval: (interval: number) => void;
    pollJitter: number;
    setPollJitter: (jitter: number) => void;
}

const GlobalSettings: React.FC<GlobalSettingsProps> = ({ agentModel, setAgentModel, pollInterval, setPollInterval, pollJitter, setPollJitter }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h5 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Ajan ve Global Ayarlar</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label htmlFor="agentModel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Ajan Modeli <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="agentModel"
                        value={agentModel}
                        onChange={(e) => setAgentModel(e.target.value as AgentModel)}
                        className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value={AgentModel.Hybrid}>Hybrid (Akıllı)</option>
                        <option value={AgentModel.AIHeuristic}>AI Destekli Önceliklendirme</option>
                        <option value={AgentModel.Rule}>Rule (Sabit)</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="pollInterval" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Kontrol Aralığı (sn) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        id="pollInterval"
                        value={pollInterval}
                        onChange={(e) => setPollInterval(Number(e.target.value))}
                        min="15"
                        className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="pollJitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Jitter (±sn)
                    </label>
                    <input
                        type="number"
                        id="pollJitter"
                        value={pollJitter}
                        onChange={(e) => setPollJitter(Number(e.target.value))}
                        min="0"
                        className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>
        </div>
    );
};

export default GlobalSettings;
