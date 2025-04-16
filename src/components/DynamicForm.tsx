import { useState, useEffect } from 'react'
import { FormField, FormConfig, getFieldsForType, validateField, isFieldVisible } from '../utils/formConfig'

interface DynamicFormProps {
  config: FormConfig
  initialData?: any
  onSubmit: (data: any) => void
  onCancel: () => void
}

export default function DynamicForm({ config, initialData, onSubmit, onCancel }: DynamicFormProps) {
  const [formData, setFormData] = useState<any>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [fields, setFields] = useState<FormField[]>([])

  useEffect(() => {
    // Initialize form data with default values
    const initialFormData = { ...initialData }
    const typeSpecificFields = getFieldsForType(config, initialFormData.type || '')
    const currentFields = [
      ...config.base_fields,
      ...typeSpecificFields
    ]
    
    currentFields.forEach(field => {
      if (initialFormData[field.name] === undefined) {
        initialFormData[field.name] = getDefaultValue(field)
      }
    })

    setFormData(initialFormData)
    setFields(currentFields)
  }, [config, initialData])

  const handleInputChange = (field: FormField, value: any) => {
    const newFormData = { ...formData, [field.name]: value }
    setFormData(newFormData)

    // Update fields when type changes
    if (field.name === 'type') {
      const typeSpecificFields = getFieldsForType(config, value)
        .filter(field => !config.base_fields.some(bf => bf.name === field.name))
      const newFields = [
        ...config.base_fields,
        ...typeSpecificFields
      ]
      setFields(newFields)
      
      // Reset form data with default values for the new type
      const resetFormData: any = { ...formData, type: value }
      
      // Only reset type-specific fields, keep base fields
      newFields.forEach(f => {
        if (f.name !== 'type' && !config.base_fields.some(bf => bf.name === f.name)) {
          resetFormData[f.name] = getDefaultValue(f)
        }
      })
      setFormData(resetFormData)
    }

    // Validate field
    const error = validateField(field, value)
    if (error) {
      setErrors(prev => ({ ...prev, [field.name]: error }))
    } else {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field.name]
        return newErrors
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields
    const newErrors: Record<string, string> = {}
    fields.forEach(field => {
      if (isFieldVisible(field, formData)) {
        const error = validateField(field, formData[field.name])
        if (error) {
          newErrors[field.name] = error
        }
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  const renderField = (field: FormField) => {
    if (!isFieldVisible(field, formData)) return null

    const value = formData[field.name]
    const error = errors[field.name]

    switch (field.type) {
      case 'text':
      case 'password':
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type}
              value={value || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                error ? 'border-red-500' : ''
              }`}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            {field.description && <p className="mt-1 text-sm text-gray-500">{field.description}</p>}
          </div>
        )

      case 'number':
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              value={value || ''}
              onChange={(e) => handleInputChange(field, Number(e.target.value))}
              min={field.min}
              max={field.max}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                error ? 'border-red-500' : ''
              }`}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            {field.description && <p className="mt-1 text-sm text-gray-500">{field.description}</p>}
          </div>
        )

      case 'select':
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={value || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                error ? 'border-red-500' : ''
              }`}
            >
              {Array.isArray(field.options) ? (
                field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))
              ) : (
                Object.entries(field.options || {}).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))
              )}
            </select>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            {field.description && <p className="mt-1 text-sm text-gray-500">{field.description}</p>}
          </div>
        )

      case 'boolean':
        return (
          <div key={field.name} className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={value || false}
                onChange={(e) => handleInputChange(field, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </span>
            </label>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            {field.description && <p className="mt-1 text-sm text-gray-500">{field.description}</p>}
          </div>
        )

      case 'array':
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="mt-1 space-y-4">
              {(value || []).map((item: any, index: number) => (
                <div key={index} className="flex flex-col space-y-2 p-4 border rounded-md">
                  {field.item_type === 'object' && field.fields ? (
                    <div className="space-y-4">
                      {field.fields.map(subField => (
                        <div key={subField.name} className="flex flex-col">
                          <label className="block text-sm font-medium text-gray-700">
                            {subField.label}
                            {subField.required && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type={subField.type === 'password' ? 'password' : 'text'}
                            value={item[subField.name] || ''}
                            onChange={(e) => {
                              const newItems = [...(value || [])]
                              newItems[index] = { ...newItems[index], [subField.name]: e.target.value }
                              handleInputChange(field, newItems)
                            }}
                            placeholder={subField.description}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                          {subField.description && (
                            <p className="mt-1 text-sm text-gray-500">{subField.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <input
                      type={field.item_type === 'number' ? 'number' : 'text'}
                      value={item || ''}
                      onChange={(e) => {
                        const newItems = [...(value || [])]
                        newItems[index] = field.item_type === 'number' ? Number(e.target.value) : e.target.value
                        handleInputChange(field, newItems)
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const newItems = [...(value || [])]
                      newItems.splice(index, 1)
                      handleInputChange(field, newItems)
                    }}
                    className="self-end text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newItems = [...(value || [])]
                  if (field.item_type === 'object' && field.fields) {
                    const newItem: any = {}
                    field.fields.forEach(f => {
                      newItem[f.name] = getDefaultValue(f)
                    })
                    newItems.push(newItem)
                  } else {
                    newItems.push(field.item_type === 'number' ? 0 : '')
                  }
                  handleInputChange(field, newItems)
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Add {field.label}
              </button>
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            {field.description && <p className="mt-1 text-sm text-gray-500">{field.description}</p>}
          </div>
        )

      case 'object':
        // Initialize object value if not exists
        let currentValue = value
        if (!currentValue) {
          const defaultValue: Record<string, any> = {}
          field.fields?.forEach(f => {
            defaultValue[f.name] = getDefaultValue(f)
          })
          handleInputChange(field, defaultValue)
          currentValue = defaultValue
        }

        return (
          <div key={field.name} className="mb-4">
            <div className="flex items-center">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.description && (
                <div className="ml-1 group relative">
                  <div className="text-gray-400 hover:text-gray-500 cursor-help">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="hidden group-hover:block absolute z-10 w-64 p-2 mt-1 text-sm bg-gray-900 text-white rounded-md shadow-lg">
                    {field.description}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-2 space-y-3 border border-gray-200 rounded-md p-4 bg-gray-50">
              {field.fields?.map(subField => {
                // Check visibility using the parent object's name
                const isVisible = isFieldVisible(subField, {
                  [field.name]: currentValue
                })

                if (!isVisible) return null

                return (
                  <div key={subField.name} className="flex flex-col">
                    {subField.type === 'boolean' ? (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={currentValue?.[subField.name] || false}
                          onChange={(e) => {
                            handleInputChange(field, {
                              ...currentValue,
                              [subField.name]: e.target.checked
                            })
                          }}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <label className="ml-2 flex items-center text-sm font-medium text-gray-700">
                          {subField.label}
                          {subField.required && <span className="text-red-500">*</span>}
                          {subField.description && (
                            <div className="ml-1 group relative">
                              <div className="text-gray-400 hover:text-gray-500 cursor-help">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div className="hidden group-hover:block absolute z-10 w-64 p-2 mt-1 text-sm bg-gray-900 text-white rounded-md shadow-lg">
                                {subField.description}
                              </div>
                            </div>
                          )}
                        </label>
                      </div>
                    ) : subField.type === 'select' ? (
                      <>
                        <div className="flex items-center">
                          <label className="block text-sm font-medium text-gray-700">
                            {subField.label}
                            {subField.required && <span className="text-red-500">*</span>}
                          </label>
                          {subField.description && (
                            <div className="ml-1 group relative">
                              <div className="text-gray-400 hover:text-gray-500 cursor-help">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div className="hidden group-hover:block absolute z-10 w-64 p-2 mt-1 text-sm bg-gray-900 text-white rounded-md shadow-lg">
                                {subField.description}
                              </div>
                            </div>
                          )}
                        </div>
                        <select
                          value={currentValue?.[subField.name] || ''}
                          onChange={(e) => {
                            handleInputChange(field, {
                              ...currentValue,
                              [subField.name]: e.target.value
                            })
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white"
                        >
                          {Array.isArray(subField.options) ? (
                            subField.options.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))
                          ) : (
                            Object.entries(subField.options || {}).map(([key, label]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            ))
                          )}
                        </select>
                      </>
                    ) : subField.type === 'number' ? (
                      <>
                        <div className="flex items-center">
                          <label className="block text-sm font-medium text-gray-700">
                            {subField.label}
                            {subField.required && <span className="text-red-500">*</span>}
                          </label>
                          {subField.description && (
                            <div className="ml-1 group relative">
                              <div className="text-gray-400 hover:text-gray-500 cursor-help">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div className="hidden group-hover:block absolute z-10 w-64 p-2 mt-1 text-sm bg-gray-900 text-white rounded-md shadow-lg">
                                {subField.description}
                              </div>
                            </div>
                          )}
                        </div>
                        <input
                          type="number"
                          value={currentValue?.[subField.name] || ''}
                          onChange={(e) => {
                            handleInputChange(field, {
                              ...currentValue,
                              [subField.name]: Number(e.target.value)
                            })
                          }}
                          min={subField.min}
                          max={subField.max}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white"
                        />
                      </>
                    ) : (
                      <>
                        <div className="flex items-center">
                          <label className="block text-sm font-medium text-gray-700">
                            {subField.label}
                            {subField.required && <span className="text-red-500">*</span>}
                          </label>
                          {subField.description && (
                            <div className="ml-1 group relative">
                              <div className="text-gray-400 hover:text-gray-500 cursor-help">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div className="hidden group-hover:block absolute z-10 w-64 p-2 mt-1 text-sm bg-gray-900 text-white rounded-md shadow-lg">
                                {subField.description}
                              </div>
                            </div>
                          )}
                        </div>
                        <input
                          type={subField.type === 'password' ? 'password' : 'text'}
                          value={currentValue?.[subField.name] || ''}
                          onChange={(e) => {
                            handleInputChange(field, {
                              ...currentValue,
                              [subField.name]: e.target.value
                            })
                          }}
                          placeholder={`Enter ${subField.label.toLowerCase()}`}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white"
                        />
                      </>
                    )}
                  </div>
                )
              })}
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map(renderField)}
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Submit
        </button>
      </div>
    </form>
  )
}

const getDefaultValue = (field: FormField): any => {
  // If field has a default value defined, use it
  if (field.default !== undefined) {
    return field.default
  }

  // Otherwise use type-specific defaults
  switch (field.type) {
    case 'text':
    case 'password':
      return ''
    case 'number':
      return 0
    case 'boolean':
      return false
    case 'select':
      if (Array.isArray(field.options)) {
        return field.options[0] || ''
      } else if (typeof field.options === 'object') {
        return Object.keys(field.options)[0] || ''
      }
      return ''
    case 'array':
      return []
    case 'object':
      return {}
    default:
      return ''
  }
} 