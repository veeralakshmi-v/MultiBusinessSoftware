import React, { useState, useEffect } from 'react';
import { FormSchemaDefinition, FormFieldDefinition } from '../../types/form';
import { FormEngine } from '../../lib/forms/formEngine';
import { cn } from '../../lib/utils';
import { Image as ImageIcon, AlertCircle, Check, Upload, X } from 'lucide-react';

interface DynamicFormRendererProps {
  schema: FormSchemaDefinition;
  initialValues?: Record<string, any>;
  existingRecords?: any[];
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function DynamicFormRenderer({
  schema,
  initialValues = {},
  existingRecords = [],
  onSubmit,
  onCancel,
  isLoading = false,
}: DynamicFormRendererProps) {
  const [formData, setFormData] = useState<Record<string, any>>(() =>
    FormEngine.generateDefaultValues(schema, initialValues)
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setFormData(FormEngine.generateDefaultValues(schema, initialValues));
    setErrors({});
    setTouched({});
  }, [schema, initialValues]);

  const handleChange = (fieldId: string, value: any) => {
    const nextFormData = { ...formData, [fieldId]: value };
    setFormData(nextFormData);

    // Live validate touched field
    const field = schema.fields.find(f => f.fieldId === fieldId);
    if (field) {
      const error = FormEngine.validateField(field, value, nextFormData, existingRecords);
      setErrors(prev => {
        const next = { ...prev };
        if (error) {
          next[fieldId] = error;
        } else {
          delete next[fieldId];
        }
        return next;
      });
    }
  };

  const handleBlur = (fieldId: string) => {
    setTouched(prev => ({ ...prev, [fieldId]: true }));
    const field = schema.fields.find(f => f.fieldId === fieldId);
    if (field) {
      const error = FormEngine.validateField(field, formData[fieldId], formData, existingRecords);
      if (error) {
        setErrors(prev => ({ ...prev, [fieldId]: error }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = FormEngine.validateForm(schema, formData, existingRecords);

    if (!result.isValid) {
      setErrors(result.errors);
      const allTouched: Record<string, boolean> = {};
      schema.fields.forEach(f => {
        allTouched[f.fieldId] = true;
      });
      setTouched(allTouched);
      return;
    }

    onSubmit(formData);
  };

  const visibleFields = schema.fields
    .filter(field => FormEngine.isFieldVisible(field, formData))
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {schema.title && (
        <div className="border-b border-[#1F1F21] pb-3">
          <h3 className="text-base font-bold text-white">{schema.title}</h3>
          {schema.description && (
            <p className="text-xs text-gray-400 mt-0.5">{schema.description}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        {visibleFields.map(field => {
          const isFieldRequired = field.validation?.isRequired;
          const fieldError = touched[field.fieldId] ? errors[field.fieldId] : undefined;
          const spanClass =
            field.gridSpan === 12
              ? 'col-span-12'
              : field.gridSpan === 8
              ? 'col-span-12 md:col-span-8'
              : field.gridSpan === 4
              ? 'col-span-12 md:col-span-4'
              : field.gridSpan === 3
              ? 'col-span-6 md:col-span-3'
              : 'col-span-12 md:col-span-6';

          return (
            <div key={field.fieldId} className={cn(spanClass, 'space-y-1.5')}>
              <label className="block text-xs font-bold text-gray-300 tracking-wide">
                {field.label} {isFieldRequired && <span className="text-red-400">*</span>}
              </label>

              {/* 1. TEXT */}
              {field.controlType === 'TEXT' && (
                <input
                  type="text"
                  value={formData[field.fieldId] ?? ''}
                  onChange={e => handleChange(field.fieldId, e.target.value)}
                  onBlur={() => handleBlur(field.fieldId)}
                  placeholder={field.placeholder}
                  className={cn(
                    "w-full bg-[#0A0A0B] border text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition-colors",
                    fieldError
                      ? "border-red-500/80 focus:border-red-500"
                      : "border-[#2D2D30] focus:border-[#C5A059]"
                  )}
                />
              )}

              {/* 2. NUMBER */}
              {field.controlType === 'NUMBER' && (
                <input
                  type="number"
                  step="any"
                  value={formData[field.fieldId] ?? ''}
                  onChange={e => handleChange(field.fieldId, e.target.value === '' ? '' : Number(e.target.value))}
                  onBlur={() => handleBlur(field.fieldId)}
                  placeholder={field.placeholder || '0'}
                  className={cn(
                    "w-full bg-[#0A0A0B] border text-white rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none transition-colors",
                    fieldError
                      ? "border-red-500/80 focus:border-red-500"
                      : "border-[#2D2D30] focus:border-[#C5A059]"
                  )}
                />
              )}

              {/* 3. DATE */}
              {field.controlType === 'DATE' && (
                <input
                  type="date"
                  value={formData[field.fieldId] ?? ''}
                  onChange={e => handleChange(field.fieldId, e.target.value)}
                  onBlur={() => handleBlur(field.fieldId)}
                  className={cn(
                    "w-full bg-[#0A0A0B] border text-white rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none transition-colors",
                    fieldError
                      ? "border-red-500/80 focus:border-red-500"
                      : "border-[#2D2D30] focus:border-[#C5A059]"
                  )}
                />
              )}

              {/* 4. DROPDOWN */}
              {field.controlType === 'DROPDOWN' && (
                <select
                  value={formData[field.fieldId] ?? ''}
                  onChange={e => handleChange(field.fieldId, e.target.value)}
                  onBlur={() => handleBlur(field.fieldId)}
                  className={cn(
                    "w-full bg-[#0A0A0B] border text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition-colors",
                    fieldError
                      ? "border-red-500/80 focus:border-red-500"
                      : "border-[#2D2D30] focus:border-[#C5A059]"
                  )}
                >
                  <option value="" disabled>Select {field.label}</option>
                  {field.options?.map(opt => (
                    <option key={String(opt.value)} value={String(opt.value)}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {/* 5. CHECKBOX */}
              {field.controlType === 'CHECKBOX' && (
                <label className="flex items-center gap-3 py-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={Boolean(formData[field.fieldId])}
                    onChange={e => handleChange(field.fieldId, e.target.checked)}
                    className="w-4 h-4 rounded bg-[#0A0A0B] border-[#2D2D30] accent-[#C5A059]"
                  />
                  <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">
                    {field.placeholder || `Enable ${field.label}`}
                  </span>
                </label>
              )}

              {/* 6. RADIO */}
              {field.controlType === 'RADIO' && (
                <div className="flex flex-wrap items-center gap-4 py-2">
                  {field.options?.map(opt => (
                    <label key={String(opt.value)} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-300">
                      <input
                        type="radio"
                        name={field.fieldId}
                        value={String(opt.value)}
                        checked={String(formData[field.fieldId]) === String(opt.value)}
                        onChange={e => handleChange(field.fieldId, e.target.value)}
                        className="accent-[#C5A059]"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* 7. TEXTAREA */}
              {field.controlType === 'TEXTAREA' && (
                <textarea
                  rows={3}
                  value={formData[field.fieldId] ?? ''}
                  onChange={e => handleChange(field.fieldId, e.target.value)}
                  onBlur={() => handleBlur(field.fieldId)}
                  placeholder={field.placeholder}
                  className={cn(
                    "w-full bg-[#0A0A0B] border text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition-colors resize-y",
                    fieldError
                      ? "border-red-500/80 focus:border-red-500"
                      : "border-[#2D2D30] focus:border-[#C5A059]"
                  )}
                />
              )}

              {/* 8. IMAGE_UPLOAD */}
              {field.controlType === 'IMAGE_UPLOAD' && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData[field.fieldId] ?? ''}
                      onChange={e => handleChange(field.fieldId, e.target.value)}
                      onBlur={() => handleBlur(field.fieldId)}
                      placeholder="https://example.com/image.jpg"
                      className={cn(
                        "flex-1 bg-[#0A0A0B] border text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none transition-colors",
                        fieldError
                          ? "border-red-500/80 focus:border-red-500"
                          : "border-[#2D2D30] focus:border-[#C5A059]"
                      )}
                    />
                    {formData[field.fieldId] && (
                      <button
                        type="button"
                        onClick={() => handleChange(field.fieldId, '')}
                        className="p-2 bg-[#1A1A1C] hover:bg-[#2D2D30] text-gray-400 hover:text-red-400 rounded-xl transition-colors"
                        title="Clear image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {formData[field.fieldId] && (
                    <div className="w-24 h-24 rounded-xl overflow-hidden border border-[#2D2D30] bg-[#161618] relative group">
                      <img
                        src={formData[field.fieldId]}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e: any) => {
                          e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150';
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {field.helpText && !fieldError && (
                <p className="text-[10px] text-gray-500">{field.helpText}</p>
              )}

              {fieldError && (
                <p className="text-red-400 text-[11px] flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  {fieldError}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1F1F21]">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:bg-[#1A1A1C] transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#C5A059] text-[#0A0A0B] uppercase tracking-wider shadow-lg shadow-[#C5A059]/20 hover:bg-[#b08d4a] transition-all flex items-center gap-2"
        >
          {schema.submitButtonText || 'Submit Form'}
        </button>
      </div>
    </form>
  );
}
