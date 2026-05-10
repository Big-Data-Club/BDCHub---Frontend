"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

import type {
  FillBlankDropdownSettings,
  FillBlankDropdownOption,
  FillBlankDropdownEditorProps,
} from '@/types';
import { useMarkdownImage } from '@/hooks/useMarkdownImage';
import { Image } from 'lucide-react';

/**
 * Component để teacher tạo câu hỏi FILL_BLANK_DROPDOWN
 * 
 * Features:
 * - Auto-detect {BLANK_X} trong question text
 * - Quản lý options cho mỗi blank (dropdown items)
 * - Đảm bảo mỗi blank có ít nhất 2 options và đúng 1 correct option
 */
export default function FillBlankDropdownEditor({
  questionText,
  settings: initialSettings,
  options,
  onChange,
}: FillBlankDropdownEditorProps) {
  const [localText, setLocalText] = useState(questionText);
  const [localOptions, setLocalOptions] = useState<FillBlankDropdownOption[]>(options);
  const [settings, setSettings] = useState<FillBlankDropdownSettings>(
    initialSettings || { blank_count: 0, blanks: [] }
  );
  const { uploadImage, uploading } = useMarkdownImage();

  // Auto-detect blanks from question text
  useEffect(() => {
    const blankMatches = localText.match(/\{BLANK_(\d+)\}/g);
    if (blankMatches) {
      const blankIds = blankMatches
        .map(m => parseInt(m.match(/\d+/)![0]))
        .filter((id, index, self) => self.indexOf(id) === index)
        .sort((a, b) => a - b);

      const newSettings: FillBlankDropdownSettings = {
        blank_count: blankIds.length,
        blanks: blankIds.map(id => {
          const existing = settings.blanks.find(b => b.blank_id === id);
          return existing || {
            blank_id: id,
            label: `Dropdown ${id}`,
          };
        }),
      };

      setSettings(newSettings);

      // Initialize options for new blanks
      const existingBlankIds = new Set(localOptions.map(o => o.blank_id));
      const newOptions = [...localOptions];
      
      blankIds.forEach(blankId => {
        if (!existingBlankIds.has(blankId)) {
          // Add 2 default options for new blank
          newOptions.push(
            {
              blank_id: blankId,
              option_text: '',
              is_correct: true,
              order_index: 0,
            },
            {
              blank_id: blankId,
              option_text: '',
              is_correct: false,
              order_index: 1,
            }
          );
        }
      });

      setLocalOptions(newOptions);
      onChange(localText, newSettings, newOptions);
    } else {
      setSettings({ blank_count: 0, blanks: [] });
      onChange(localText, { blank_count: 0, blanks: [] }, localOptions);
    }
  }, [localText]);

  // Update blank label
  const updateBlankLabel = (blankId: number, label: string) => {
    const newSettings = {
      ...settings,
      blanks: settings.blanks.map(b =>
        b.blank_id === blankId ? { ...b, label } : b
      ),
    };
    setSettings(newSettings);
    onChange(localText, newSettings, localOptions);
  };

  // Add option
  const addOption = (blankId: number) => {
    const optionsForBlank = localOptions.filter(o => o.blank_id === blankId);
    const nextOrderIndex = optionsForBlank.length;
    
    const newOptions = [
      ...localOptions,
      {
        blank_id: blankId,
        option_text: '',
        is_correct: false,
        order_index: nextOrderIndex,
      },
    ];
    setLocalOptions(newOptions);
    onChange(localText, settings, newOptions);
  };

  // Update option
  const updateOption = (
    optionIndex: number,
    field: keyof FillBlankDropdownOption,
    value: any
  ) => {
    const newOptions = localOptions.map((opt, i) => {
      if (i === optionIndex) {
        // If setting is_correct to true, unset others in same blank
        if (field === 'is_correct' && value === true) {
          return { ...opt, is_correct: true };
        }
        return { ...opt, [field]: value };
      }
      // Unset is_correct for other options in same blank
      if (field === 'is_correct' && value === true && opt.blank_id === localOptions[optionIndex].blank_id) {
        return { ...opt, is_correct: false };
      }
      return opt;
    });
    setLocalOptions(newOptions);
    onChange(localText, settings, newOptions);
  };

  // Remove option
  const removeOption = (optionIndex: number) => {
    const newOptions = localOptions.filter((_, i) => i !== optionIndex);
    setLocalOptions(newOptions);
    onChange(localText, settings, newOptions);
  };

  // Get options for a specific blank
  const getOptionsForBlank = (blankId: number) => {
    return localOptions
      .map((opt, index) => ({ ...opt, originalIndex: index }))
      .filter(opt => opt.blank_id === blankId)
      .sort((a, b) => a.order_index - b.order_index);
  };

  // Validate blank
  const validateBlank = (blankId: number) => {
    const options = getOptionsForBlank(blankId);
    const errors: string[] = [];

    if (options.length < 2) {
      errors.push('Cần ít nhất 2 options');
    }

    const correctCount = options.filter(o => o.is_correct).length;
    if (correctCount === 0) {
      errors.push('Chưa chọn đáp án đúng');
    } else if (correctCount > 1) {
      errors.push('Chỉ được chọn 1 đáp án đúng');
    }

    const emptyOptions = options.filter(o => !o.option_text.trim());
    return errors;
  };
    
  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          const url = await uploadImage(file);
          const cursorPosition = (document.activeElement as HTMLTextAreaElement)?.selectionStart || localText.length;
          const textBefore = localText.substring(0, cursorPosition);
          const textAfter = localText.substring(cursorPosition);
          const insertion = (textBefore.endsWith('\n') || textBefore === '' ? '' : '\n') + `![image](${url})` + (textAfter.startsWith('\n') ? '' : '\n');
          setLocalText(textBefore + insertion + textAfter);
        } catch (err: any) {
          alert(err.message);
        }
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-semibold text-purple-900 mb-2">💡 Hướng dẫn</h4>
        <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
          <li>Sử dụng <code className="bg-purple-100 px-1 rounded">{`{BLANK_1}`}</code>, <code className="bg-purple-100 px-1 rounded">{`{BLANK_2}`}</code>, ... trong câu hỏi</li>
          <li>Mỗi blank phải có <strong>ít nhất 2 options</strong></li>
          <li>Mỗi blank phải có <strong>đúng 1 đáp án đúng</strong></li>
          <li>Học viên sẽ chọn từ dropdown</li>
        </ul>
      </div>

      {/* Question Text Input */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Câu hỏi với blanks *
        </label>
        <div className="relative">
          <textarea
            value={localText}
            onChange={(e) => setLocalText(e.target.value)}
            className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-blue-500 font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            rows={6}
            placeholder="VD: Python is a {BLANK_1} programming language."
            required
          />
          <Button
            type="button"
            onClick={handleImageUpload}
            disabled={uploading}
            variant="ghost"
            size="sm"
            className="absolute bottom-3 right-3 text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            title="Chèn ảnh"
          >
            <Image className="w-4 h-4 mr-2" />
            {uploading ? 'Đang tải...' : 'Chèn ảnh'}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {settings.blank_count > 0
            ? `✓ Đã phát hiện ${settings.blank_count} blank(s)`
            : '⚠️ Chưa có blank nào. Sử dụng {BLANK_1}, {BLANK_2}, ...'}
        </p>
      </div>

      {/* Blank Configuration */}
      {settings.blanks.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="font-semibold text-lg mb-4">Cấu hình Dropdown Options</h3>
          
          {settings.blanks.map((blank) => {
            const optionsForBlank = getOptionsForBlank(blank.blank_id);
            const errors = validateBlank(blank.blank_id);
            const hasErrors = errors.length > 0;
            
            return (
              <div
                key={blank.blank_id}
                className={`border rounded-lg p-4 mb-4 ${
                  hasErrors ? 'bg-red-50 border-red-300' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                      {`{BLANK_${blank.blank_id}}`}
                    </span>
                    {hasErrors && (
                      <span className="text-xs text-red-600 font-medium">
                        ⚠️ {errors.join(' • ')}
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    onClick={() => addOption(blank.blank_id)}
                    variant="outline"
                    className="text-xs px-3 py-1"
                  >
                    + Thêm option
                  </Button>
                </div>

                {/* Blank Label */}
                <div className="mb-4">
                  <label className="block text-xs font-medium mb-1 text-gray-700">
                    Tên hiển thị
                  </label>
                  <input
                    type="text"
                    value={blank.label || ''}
                    onChange={(e) => updateBlankLabel(blank.blank_id, e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg"
                    placeholder="VD: Loại ngôn ngữ"
                  />
                </div>

                {/* Options List */}
                <div className="space-y-2">
                  {optionsForBlank.length === 0 ? (
                    <div className="text-center py-4 bg-white border-2 border-dashed rounded-lg">
                      <p className="text-sm text-gray-500 mb-2">
                        Chưa có option nào
                      </p>
                      <Button
                        type="button"
                        onClick={() => addOption(blank.blank_id)}
                        variant="outline"
                        className="text-xs"
                      >
                        + Thêm option đầu tiên
                      </Button>
                    </div>
                  ) : (
                    optionsForBlank.map((option) => (
                      <div
                        key={option.originalIndex}
                        className="bg-white border rounded-lg p-3 flex items-center gap-2"
                      >
                        {/* Correct Radio */}
                        <input
                          type="radio"
                          name={`blank-${blank.blank_id}-correct`}
                          checked={option.is_correct}
                          onChange={(e) =>
                            updateOption(
                              option.originalIndex,
                              'is_correct',
                              e.target.checked
                            )
                          }
                          className="w-4 h-4"
                          title="Đáp án đúng"
                        />

                        {/* Option Text */}
                        <input
                          type="text"
                          value={option.option_text}
                          onChange={(e) =>
                            updateOption(
                              option.originalIndex,
                              'option_text',
                              e.target.value
                            )
                          }
                          className={`flex-1 px-3 py-2 text-sm border rounded-lg ${
                            option.is_correct
                              ? 'bg-green-50 border-green-300 font-medium'
                              : ''
                          }`}
                          placeholder="Nội dung option..."
                          required
                        />

                        {/* Order Index (hidden but editable if needed) */}
                        <input
                          type="number"
                          value={option.order_index}
                          onChange={(e) =>
                            updateOption(
                              option.originalIndex,
                              'order_index',
                              parseInt(e.target.value)
                            )
                          }
                          className="w-16 px-2 py-2 text-sm text-center border rounded-lg"
                          min="0"
                          title="Thứ tự"
                        />

                        {/* Remove Button */}
                        {optionsForBlank.length > 2 && (
                          <Button
                            type="button"
                            onClick={() => removeOption(option.originalIndex)}
                            variant="outline"
                            className="px-3 py-2 text-red-600 hover:bg-red-50"
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  💡 Click radio để chọn đáp án đúng. Số bên phải là thứ tự hiển thị.
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Validation Summary */}
      {settings.blanks.length > 0 && (
        <div className="bg-gray-50 border rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-2">📊 Tổng quan</h4>
          <ul className="text-sm space-y-1">
            <li>• Tổng số blanks: <strong>{settings.blank_count}</strong></li>
            <li>• Tổng số options: <strong>{localOptions.length}</strong></li>
            {settings.blanks.map(blank => {
              const options = getOptionsForBlank(blank.blank_id);
              const errors = validateBlank(blank.blank_id);
              const isValid = errors.length === 0;
              
              return (
                <li
                  key={blank.blank_id}
                  className={isValid ? 'text-green-600' : 'text-red-600'}
                >
                  • {`{BLANK_${blank.blank_id}}`}: <strong>{options.length}</strong> options
                  {isValid ? ' ✓' : ' ⚠️'}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}