import React from 'react';
import { CustomizationOption, CustomizationInput } from '../../types';
import { Sparkles, Type } from 'lucide-react';

interface CustomizationFormProps {
  config: CustomizationOption;
  value: CustomizationInput;
  onChange: (value: CustomizationInput) => void;
}

export const CustomizationForm: React.FC<CustomizationFormProps> = ({
  config,
  value,
  onChange
}) => {
  return (
    <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 space-y-4 my-4">
      <div className="flex items-center gap-2 border-b border-amber-200/60 pb-3">
        <Sparkles size={18} className="text-amber-800" />
        <h4 className="font-serif font-bold text-amber-950 text-sm">
          Bespoke Customization Available
        </h4>
      </div>

      {/* Custom Text Field */}
      {config.allowText && (
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-stone-800">
            {config.textLabel || 'Name or Initials for Engraving'}
            {config.maxCharacters && (
              <span className="text-stone-400 font-normal ml-1">
                (Max {config.maxCharacters} chars)
              </span>
            )}
          </label>
          <input
            type="text"
            placeholder="e.g. Ayesha / عائشہ"
            maxLength={config.maxCharacters || 20}
            value={value.customText || ''}
            onChange={(e) => onChange({ ...value, customText: e.target.value })}
            className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800/30 focus:border-amber-800"
          />
        </div>
      )}

      {/* Font Selection */}
      {config.allowFontSelection && config.fonts && config.fonts.length > 0 && (
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-stone-800">
            Select Calligraphy / Font Style
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {config.fonts.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onChange({ ...value, selectedFont: f })}
                className={`px-3 py-2 rounded-xl text-xs font-medium text-center border transition-all ${
                  value.selectedFont === f
                    ? 'bg-amber-900 text-white border-amber-900 shadow-2xs font-semibold'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stone Selection */}
      {config.allowStoneSelection && config.stones && config.stones.length > 0 && (
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-stone-800">
            Select Center Stone
          </label>
          <select
            value={value.selectedStone || ''}
            onChange={(e) => onChange({ ...value, selectedStone: e.target.value })}
            className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/30"
          >
            <option value="">-- Choose Gemstone --</option>
            {config.stones.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Custom Note */}
      {config.allowNote && (
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-stone-800">
            {config.noteLabel || 'Gift Message / Packaging Instruction'}
          </label>
          <textarea
            rows={2}
            placeholder="Write a special card message or specific sizing instructions..."
            value={value.customNote || ''}
            onChange={(e) => onChange({ ...value, customNote: e.target.value })}
            className="w-full bg-white border border-stone-300 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800/30"
          />
        </div>
      )}
    </div>
  );
};
