/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import type { MedicalCondition, Allergy, ChronicCondition } from '../types';

interface MedicalHistoryManagerProps {
  allergies: Allergy[];
  chronicConditions: ChronicCondition[];
  medicalConditions: MedicalCondition[];
  onAllergiesChange: (allergies: Allergy[]) => void;
  onChronicChange: (conditions: ChronicCondition[]) => void;
  onMedicalChange: (conditions: MedicalCondition[]) => void;
  darkMode: boolean;
}

type TabType = 'allergies' | 'chronic' | 'medical';

/**
 * MedicalHistoryManager Component
 *
 * Manages medical history with three tabs for allergies, chronic conditions, and medical conditions.
 * Provides UI for adding, editing, and removing medical information.
 *
 * @component
 * @example
 * ```tsx
 * <MedicalHistoryManager
 *   allergies={patientAllergies}
 *   chronicConditions={patientChronicConditions}
 *   medicalConditions={patientMedicalConditions}
 *   onAllergiesChange={handleAllergiesChange}
 *   onChronicChange={handleChronicChange}
 *   onMedicalChange={handleMedicalChange}
 *   darkMode={isDarkMode}
 * />
 * ```
 */
const MedicalHistoryManager: React.FC<MedicalHistoryManagerProps> = ({
  allergies,
  chronicConditions,
  medicalConditions,
  onAllergiesChange,
  onChronicChange,
  onMedicalChange,
  darkMode,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('allergies');

  // ==================== ALLERGY HANDLERS ====================

  /**
   * Handle adding a new allergy to the list
   */
  const handleAddAllergy = (): void => {
    const newAllergy: Allergy = {
      id: Date.now().toString(),
      allergen: '',
      reaction: '',
      severity: 'Mild',
      diagnosedDate: new Date().toISOString().split('T')[0],
    };
    onAllergiesChange([...allergies, newAllergy]);
  };

  /**
   * Handle updating an allergy in the list
   * @param id - The ID of the allergy to update
   * @param field - The field to update
   * @param value - The new value for the field
   */
  const handleUpdateAllergy = (
    id: string,
    field: keyof Allergy,
    value: string
  ): void => {
    const updated = allergies.map((allergy) =>
      allergy.id === id ? { ...allergy, [field]: value } : allergy
    );
    onAllergiesChange(updated);
  };

  /**
   * Handle removing an allergy from the list
   * @param id - The ID of the allergy to remove
   */
  const handleRemoveAllergy = (id: string): void => {
    const updated = allergies.filter((allergy) => allergy.id !== id);
    onAllergiesChange(updated);
  };

  // ==================== CHRONIC CONDITION HANDLERS ====================

  /**
   * Handle adding a new chronic condition to the list
   */
  const handleAddChronicCondition = (): void => {
    const newCondition: ChronicCondition = {
      id: Date.now().toString(),
      condition: '',
      diagnosedDate: new Date().toISOString().split('T')[0],
      currentMedication: '',
      controlled: false,
      notes: '',
    };
    onChronicChange([...chronicConditions, newCondition]);
  };

  /**
   * Handle updating a chronic condition in the list
   * @param id - The ID of the condition to update
   * @param field - The field to update
   * @param value - The new value for the field
   */
  const handleUpdateChronicCondition = (
    id: string,
    field: keyof ChronicCondition,
    value: string | boolean
  ): void => {
    const updated = chronicConditions.map((condition) =>
      condition.id === id ? { ...condition, [field]: value } : condition
    );
    onChronicChange(updated);
  };

  /**
   * Handle removing a chronic condition from the list
   * @param id - The ID of the condition to remove
   */
  const handleRemoveChronicCondition = (id: string): void => {
    const updated = chronicConditions.filter((condition) => condition.id !== id);
    onChronicChange(updated);
  };

  // ==================== MEDICAL CONDITION HANDLERS ====================

  /**
   * Handle adding a new medical condition to the list
   */
  const handleAddMedicalCondition = (): void => {
    const newCondition: MedicalCondition = {
      id: Date.now().toString(),
      condition: '',
      diagnosedDate: new Date().toISOString().split('T')[0],
      notes: '',
      severity: 'Mild',
      active: true,
    };
    onMedicalChange([...medicalConditions, newCondition]);
  };

  /**
   * Handle updating a medical condition in the list
   * @param id - The ID of the condition to update
   * @param field - The field to update
   * @param value - The new value for the field
   */
  const handleUpdateMedicalCondition = (
    id: string,
    field: keyof MedicalCondition,
    value: string | boolean
  ): void => {
    const updated = medicalConditions.map((condition) =>
      condition.id === id ? { ...condition, [field]: value } : condition
    );
    onMedicalChange(updated);
  };

  /**
   * Handle removing a medical condition from the list
   * @param id - The ID of the condition to remove
   */
  const handleRemoveMedicalCondition = (id: string): void => {
    const updated = medicalConditions.filter((condition) => condition.id !== id);
    onMedicalChange(updated);
  };

  // ==================== RENDER HELPERS ====================

  /**
   * Render tab button with active state styling
   */
  const TabButton: React.FC<{
    tab: TabType;
    label: string;
    icon: React.ReactNode;
  }> = ({ tab, label, icon }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200',
        activeTab === tab
          ? 'bg-blue-500 text-white shadow-lg'
          : darkMode
          ? 'bg-white/5 text-gray-300 hover:bg-white/10 backdrop-blur-sm border border-white/10'
          : 'bg-white/30 text-gray-700 hover:bg-white/50 backdrop-blur-sm border border-white/20'
      )}
    >
      {icon}
      {label}
    </button>
  );

  /**
   * Render allergy card with input fields
   */
  const AllergyCard: React.FC<{ allergy: Allergy }> = ({ allergy }) => (
    <div
      className={cn(
        'relative p-4 rounded-xl backdrop-blur-sm border transition-all duration-200',
        darkMode
          ? 'bg-white/5 border-white/10 hover:bg-white/10'
          : 'bg-white/40 border-white/30 hover:bg-white/60'
      )}
    >
      {/* Delete Button */}
      <button
        onClick={() => handleRemoveAllergy(allergy.id)}
        className={cn(
          'absolute top-3 right-3 p-1.5 rounded-lg transition-colors duration-200',
          darkMode
            ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300'
            : 'hover:bg-red-100 text-red-500 hover:text-red-600'
        )}
      >
        <Trash2 size={18} />
      </button>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-10">
        {/* Allergen */}
        <div className="flex flex-col gap-1">
          <label
            className={cn(
              'text-sm font-medium',
              darkMode ? 'text-gray-300' : 'text-gray-700'
            )}
          >
            Allergen *
          </label>
          <input
            type="text"
            value={allergy.allergen}
            onChange={(e) =>
              handleUpdateAllergy(allergy.id, 'allergen', e.target.value)
            }
            placeholder="e.g., Penicillin, Peanuts"
            className={cn(
              'px-3 py-2 rounded-lg border outline-none transition-colors duration-200',
              darkMode
                ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-400 focus:bg-white/10'
                : 'bg-white/50 border-white/30 text-gray-900 placeholder-gray-500 focus:border-blue-400 focus:bg-white/70'
            )}
          />
        </div>

        {/* Reaction */}
        <div className="flex flex-col gap-1">
          <label
            className={cn(
              'text-sm font-medium',
              darkMode ? 'text-gray-300' : 'text-gray-700'
            )}
          >
            Reaction
          </label>
          <input
            type="text"
            value={allergy.reaction || ''}
            onChange={(e) =>
              handleUpdateAllergy(allergy.id, 'reaction', e.target.value)
            }
            placeholder="e.g., Rash, Itching, Anaphylaxis"
            className={cn(
              'px-3 py-2 rounded-lg border outline-none transition-colors duration-200',
              darkMode
                ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-400 focus:bg-white/10'
                : 'bg-white/50 border-white/30 text-gray-900 placeholder-gray-500 focus:border-blue-400 focus:bg-white/70'
            )}
          />
        </div>

        {/* Severity */}
        <div className="flex flex-col gap-1">
          <label
            className={cn(
              'text-sm font-medium',
              darkMode ? 'text-gray-300' : 'text-gray-700'
            )}
          >
            Severity
          </label>
          <select
            value={allergy.severity || 'Mild'}
            onChange={(e) =>
              handleUpdateAllergy(
                allergy.id,
                'severity',
                e.target.value as 'Mild' | 'Moderate' | 'Severe' | 'Life-threatening'
              )
            }
            className={cn(
              'px-3 py-2 rounded-lg border outline-none transition-colors duration-200',
              darkMode
                ? 'bg-white/5 border-white/10 text-white focus:border-blue-400 focus:bg-white/10'
                : 'bg-white/50 border-white/30 text-gray-900 focus:border-blue-400 focus:bg-white/70'
            )}
          >
            <option value="Mild">Mild</option>
            <option value="Moderate">Moderate</option>
            <option value="Severe">Severe</option>
            <option value="Life-threatening">Life-threatening</option>
          </select>
        </div>

        {/* Diagnosed Date */}
        <div className="flex flex-col gap-1">
          <label
            className={cn(
              'text-sm font-medium',
              darkMode ? 'text-gray-300' : 'text-gray-700'
            )}
          >
            Diagnosed Date
          </label>
          <input
            type="date"
            value={allergy.diagnosedDate || ''}
            onChange={(e) =>
              handleUpdateAllergy(allergy.id, 'diagnosedDate', e.target.value)
            }
            className={cn(
              'px-3 py-2 rounded-lg border outline-none transition-colors duration-200',
              darkMode
                ? 'bg-white/5 border-white/10 text-white focus:border-blue-400 focus:bg-white/10'
                : 'bg-white/50 border-white/30 text-gray-900 focus:border-blue-400 focus:bg-white/70'
            )}
          />
        </div>
      </div>
    </div>
  );

  /**
   * Render chronic condition card with input fields
   */
  const ChronicConditionCard: React.FC<{ condition: ChronicCondition }> = ({
    condition,
  }) => (
    <div
      className={cn(
        'relative p-4 rounded-xl backdrop-blur-sm border transition-all duration-200',
        darkMode
          ? 'bg-white/5 border-white/10 hover:bg-white/10'
          : 'bg-white/40 border-white/30 hover:bg-white/60'
      )}
    >
      {/* Delete Button */}
      <button
        onClick={() => handleRemoveChronicCondition(condition.id)}
        className={cn(
          'absolute top-3 right-3 p-1.5 rounded-lg transition-colors duration-200',
          darkMode
            ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300'
            : 'hover:bg-red-100 text-red-500 hover:text-red-600'
        )}
      >
        <Trash2 size={18} />
      </button>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-10">
        {/* Condition */}
        <div className="flex flex-col gap-1">
          <label
            className={cn(
              'text-sm font-medium',
              darkMode ? 'text-gray-300' : 'text-gray-700'
            )}
          >
            Condition *
          </label>
          <input
            type="text"
            value={condition.condition}
            onChange={(e) =>
              handleUpdateChronicCondition(condition.id, 'condition', e.target.value)
            }
            placeholder="e.g., Diabetes, Hypertension, Asthma"
            className={cn(
              'px-3 py-2 rounded-lg border outline-none transition-colors duration-200',
              darkMode
                ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-400 focus:bg-white/10'
                : 'bg-white/50 border-white/30 text-gray-900 placeholder-gray-500 focus:border-blue-400 focus:bg-white/70'
            )}
          />
        </div>

        {/* Diagnosed Date */}
        <div className="flex flex-col gap-1">
          <label
            className={cn(
              'text-sm font-medium',
              darkMode ? 'text-gray-300' : 'text-gray-700'
            )}
          >
            Diagnosed Date
          </label>
          <input
            type="date"
            value={condition.diagnosedDate || ''}
            onChange={(e) =>
              handleUpdateChronicCondition(
                condition.id,
                'diagnosedDate',
                e.target.value
              )
            }
            className={cn(
              'px-3 py-2 rounded-lg border outline-none transition-colors duration-200',
              darkMode
                ? 'bg-white/5 border-white/10 text-white focus:border-blue-400 focus:bg-white/10'
                : 'bg-white/50 border-white/30 text-gray-900 focus:border-blue-400 focus:bg-white/70'
            )}
          />
        </div>

        {/* Current Medication */}
        <div className="flex flex-col gap-1 md:col-span-2">
          <label
            className={cn(
              'text-sm font-medium',
              darkMode ? 'text-gray-300' : 'text-gray-700'
            )}
          >
            Current Medication
          </label>
          <input
            type="text"
            value={condition.currentMedication || ''}
            onChange={(e) =>
              handleUpdateChronicCondition(
                condition.id,
                'currentMedication',
                e.target.value
              )
            }
            placeholder="e.g., Metformin 500mg daily"
            className={cn(
              'px-3 py-2 rounded-lg border outline-none transition-colors duration-200',
              darkMode
                ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-400 focus:bg-white/10'
                : 'bg-white/50 border-white/30 text-gray-900 placeholder-gray-500 focus:border-blue-400 focus:bg-white/70'
            )}
          />
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1 md:col-span-2">
          <label
            className={cn(
              'text-sm font-medium',
              darkMode ? 'text-gray-300' : 'text-gray-700'
            )}
          >
            Notes
          </label>
          <textarea
            value={condition.notes || ''}
            onChange={(e) =>
              handleUpdateChronicCondition(condition.id, 'notes', e.target.value)
            }
            placeholder="Add any additional notes..."
            rows={2}
            className={cn(
              'px-3 py-2 rounded-lg border outline-none transition-colors duration-200 resize-none',
              darkMode
                ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-400 focus:bg-white/10'
                : 'bg-white/50 border-white/30 text-gray-900 placeholder-gray-500 focus:border-blue-400 focus:bg-white/70'
            )}
          />
        </div>

        {/* Controlled Status */}
        <div className="flex items-center gap-3 md:col-span-2">
          <input
            type="checkbox"
            id={`controlled-${condition.id}`}
            checked={condition.controlled}
            onChange={(e) =>
              handleUpdateChronicCondition(
                condition.id,
                'controlled',
                e.target.checked
              )
            }
            className="w-4 h-4 rounded cursor-pointer"
          />
          <label
            htmlFor={`controlled-${condition.id}`}
            className={cn(
              'text-sm font-medium cursor-pointer',
              darkMode ? 'text-gray-300' : 'text-gray-700'
            )}
          >
            Condition is currently controlled
          </label>
        </div>
      </div>
    </div>
  );

  /**
   * Render medical condition card with input fields
   */
  const MedicalConditionCard: React.FC<{ condition: MedicalCondition }> = ({
    condition,
  }) => (
    <div
      className={cn(
        'relative p-4 rounded-xl backdrop-blur-sm border transition-all duration-200',
        darkMode
          ? 'bg-white/5 border-white/10 hover:bg-white/10'
          : 'bg-white/40 border-white/30 hover:bg-white/60'
      )}
    >
      {/* Delete Button */}
      <button
        onClick={() => handleRemoveMedicalCondition(condition.id)}
        className={cn(
          'absolute top-3 right-3 p-1.5 rounded-lg transition-colors duration-200',
          darkMode
            ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300'
            : 'hover:bg-red-100 text-red-500 hover:text-red-600'
        )}
      >
        <Trash2 size={18} />
      </button>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-10">
        {/* Condition */}
        <div className="flex flex-col gap-1">
          <label
            className={cn(
              'text-sm font-medium',
              darkMode ? 'text-gray-300' : 'text-gray-700'
            )}
          >
            Condition *
          </label>
          <input
            type="text"
            value={condition.condition}
            onChange={(e) =>
              handleUpdateMedicalCondition(condition.id, 'condition', e.target.value)
            }
            placeholder="e.g., Hypertension, Heart Disease"
            className={cn(
              'px-3 py-2 rounded-lg border outline-none transition-colors duration-200',
              darkMode
                ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-400 focus:bg-white/10'
                : 'bg-white/50 border-white/30 text-gray-900 placeholder-gray-500 focus:border-blue-400 focus:bg-white/70'
            )}
          />
        </div>

        {/* Diagnosed Date */}
        <div className="flex flex-col gap-1">
          <label
            className={cn(
              'text-sm font-medium',
              darkMode ? 'text-gray-300' : 'text-gray-700'
            )}
          >
            Diagnosed Date
          </label>
          <input
            type="date"
            value={condition.diagnosedDate || ''}
            onChange={(e) =>
              handleUpdateMedicalCondition(
                condition.id,
                'diagnosedDate',
                e.target.value
              )
            }
            className={cn(
              'px-3 py-2 rounded-lg border outline-none transition-colors duration-200',
              darkMode
                ? 'bg-white/5 border-white/10 text-white focus:border-blue-400 focus:bg-white/10'
                : 'bg-white/50 border-white/30 text-gray-900 focus:border-blue-400 focus:bg-white/70'
            )}
          />
        </div>

        {/* Severity */}
        <div className="flex flex-col gap-1">
          <label
            className={cn(
              'text-sm font-medium',
              darkMode ? 'text-gray-300' : 'text-gray-700'
            )}
          >
            Severity
          </label>
          <select
            value={condition.severity || 'Mild'}
            onChange={(e) =>
              handleUpdateMedicalCondition(
                condition.id,
                'severity',
                e.target.value as 'Mild' | 'Moderate' | 'Severe'
              )
            }
            className={cn(
              'px-3 py-2 rounded-lg border outline-none transition-colors duration-200',
              darkMode
                ? 'bg-white/5 border-white/10 text-white focus:border-blue-400 focus:bg-white/10'
                : 'bg-white/50 border-white/30 text-gray-900 focus:border-blue-400 focus:bg-white/70'
            )}
          >
            <option value="Mild">Mild</option>
            <option value="Moderate">Moderate</option>
            <option value="Severe">Severe</option>
          </select>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1">
          <label
            className={cn(
              'text-sm font-medium',
              darkMode ? 'text-gray-300' : 'text-gray-700'
            )}
          >
            Notes
          </label>
          <textarea
            value={condition.notes || ''}
            onChange={(e) =>
              handleUpdateMedicalCondition(condition.id, 'notes', e.target.value)
            }
            placeholder="Add any additional notes..."
            rows={2}
            className={cn(
              'px-3 py-2 rounded-lg border outline-none transition-colors duration-200 resize-none',
              darkMode
                ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-400 focus:bg-white/10'
                : 'bg-white/50 border-white/30 text-gray-900 placeholder-gray-500 focus:border-blue-400 focus:bg-white/70'
            )}
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-3 md:col-span-2">
          <input
            type="checkbox"
            id={`active-${condition.id}`}
            checked={condition.active}
            onChange={(e) =>
              handleUpdateMedicalCondition(
                condition.id,
                'active',
                e.target.checked
              )
            }
            className="w-4 h-4 rounded cursor-pointer"
          />
          <label
            htmlFor={`active-${condition.id}`}
            className={cn(
              'text-sm font-medium cursor-pointer',
              darkMode ? 'text-gray-300' : 'text-gray-700'
            )}
          >
            Currently active
          </label>
        </div>
      </div>
    </div>
  );

  // ==================== RENDER MAIN COMPONENT ====================

  return (
    <div className="flex flex-col gap-6">
      {/* Tab Navigation */}
      <div className="flex gap-3 flex-wrap">
        <TabButton
          tab="allergies"
          label="All allergies"
          icon={<AlertCircle size={18} />}
        />
        <TabButton
          tab="chronic"
          label="Chronic Conditions"
          icon={<Activity size={18} />}
        />
        <TabButton
          tab="medical"
          label="Medical History"
          icon={<AlertCircle size={18} />}
        />
      </div>

      {/* Content Area */}
      <div className="flex flex-col gap-4">
        {/* Allergies Tab */}
        {activeTab === 'allergies' && (
          <>
            {allergies.length === 0 ? (
              <div
                className={cn(
                  'flex flex-col items-center justify-center gap-3 py-12 px-4 rounded-xl backdrop-blur-sm border',
                  darkMode
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white/30 border-white/20'
                )}
              >
                <AlertCircle
                  size={32}
                  className={darkMode ? 'text-gray-500' : 'text-gray-400'}
                />
                <p
                  className={cn(
                    'text-center',
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  )}
                >
                  No allergies recorded. Add one to get started.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {allergies.map((allergy) => (
                  <AllergyCard key={allergy.id} allergy={allergy} />
                ))}
              </div>
            )}

            {/* Add Button */}
            <button
              onClick={handleAddAllergy}
              className={cn(
                'flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed transition-all duration-200 font-medium',
                darkMode
                  ? 'border-blue-400/30 text-blue-400 hover:bg-blue-400/10 hover:border-blue-400/50'
                  : 'border-blue-300/50 text-blue-600 hover:bg-blue-50 hover:border-blue-400'
              )}
            >
              <Plus size={18} />
              Add Allergy
            </button>
          </>
        )}

        {/* Chronic Conditions Tab */}
        {activeTab === 'chronic' && (
          <>
            {chronicConditions.length === 0 ? (
              <div
                className={cn(
                  'flex flex-col items-center justify-center gap-3 py-12 px-4 rounded-xl backdrop-blur-sm border',
                  darkMode
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white/30 border-white/20'
                )}
              >
                <Activity
                  size={32}
                  className={darkMode ? 'text-gray-500' : 'text-gray-400'}
                />
                <p
                  className={cn(
                    'text-center',
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  )}
                >
                  No chronic conditions recorded. Add one to get started.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {chronicConditions.map((condition) => (
                  <ChronicConditionCard
                    key={condition.id}
                    condition={condition}
                  />
                ))}
              </div>
            )}

            {/* Add Button */}
            <button
              onClick={handleAddChronicCondition}
              className={cn(
                'flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed transition-all duration-200 font-medium',
                darkMode
                  ? 'border-blue-400/30 text-blue-400 hover:bg-blue-400/10 hover:border-blue-400/50'
                  : 'border-blue-300/50 text-blue-600 hover:bg-blue-50 hover:border-blue-400'
              )}
            >
              <Plus size={18} />
              Add Chronic Condition
            </button>
          </>
        )}

        {/* Medical History Tab */}
        {activeTab === 'medical' && (
          <>
            {medicalConditions.length === 0 ? (
              <div
                className={cn(
                  'flex flex-col items-center justify-center gap-3 py-12 px-4 rounded-xl backdrop-blur-sm border',
                  darkMode
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white/30 border-white/20'
                )}
              >
                <AlertCircle
                  size={32}
                  className={darkMode ? 'text-gray-500' : 'text-gray-400'}
                />
                <p
                  className={cn(
                    'text-center',
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  )}
                >
                  No medical history recorded. Add one to get started.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {medicalConditions.map((condition) => (
                  <MedicalConditionCard
                    key={condition.id}
                    condition={condition}
                  />
                ))}
              </div>
            )}

            {/* Add Button */}
            <button
              onClick={handleAddMedicalCondition}
              className={cn(
                'flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed transition-all duration-200 font-medium',
                darkMode
                  ? 'border-blue-400/30 text-blue-400 hover:bg-blue-400/10 hover:border-blue-400/50'
                  : 'border-blue-300/50 text-blue-600 hover:bg-blue-50 hover:border-blue-400'
              )}
            >
              <Plus size={18} />
              Add Medical Condition
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MedicalHistoryManager;
