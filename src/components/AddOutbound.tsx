import { useState, useEffect } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import DynamicForm from './DynamicForm'
import { loadFormConfigs } from '../utils/formConfig'

interface AddOutboundProps {
  onAdd: (outbound: any) => void
  onCancel: () => void
  initialData?: any
}

export default function AddOutbound({ onAdd, onCancel, initialData }: AddOutboundProps) {
  const [formConfig, setFormConfig] = useState<any>(null)
  const [showForm, setShowForm] = useState(!!initialData)

  useEffect(() => {
    const loadConfig = async () => {
      const config = await loadFormConfigs()
      setFormConfig(config.outbound)
    }
    loadConfig()
  }, [])

  if (!formConfig) {
    return null
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
      >
        <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
        Add New Outbound
      </button>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Add Outbound</h2>
      <DynamicForm
        config={formConfig}
        onSubmit={(data) => {
          onAdd(data)
          setShowForm(false)
        }}
        onCancel={() => {
          setShowForm(false)
          onCancel()
        }}
      />
    </div>
  )
} 