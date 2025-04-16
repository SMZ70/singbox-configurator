import { useState } from 'react'
import { PlusIcon, CogIcon, DocumentTextIcon, ArrowDownTrayIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import AddInbound from './components/AddInbound'
import AddOutbound from './components/AddOutbound'

interface ConfigSection {
  id: string
  title: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

interface Inbound {
  type: string
  tag: string
  listen: string
  listen_port: number
  [key: string]: any
}

interface Outbound {
  type: string
  tag: string
  [key: string]: any
}

const sections: ConfigSection[] = [
  { id: 'inbounds', title: 'Inbounds', icon: DocumentTextIcon },
  { id: 'outbounds', title: 'Outbounds', icon: DocumentTextIcon },
  { id: 'route', title: 'Route', icon: CogIcon },
  { id: 'dns', title: 'DNS', icon: CogIcon },
]

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('inbounds')
  const [inbounds, setInbounds] = useState<Inbound[]>([])
  const [outbounds, setOutbounds] = useState<Outbound[]>([])
  const [editingItem, setEditingItem] = useState<{ type: 'inbound' | 'outbound', index: number } | null>(null)

  console.log('Active section:', activeSection)

  const handleAddInbound = (inbound: Inbound) => {
    setInbounds([...inbounds, inbound])
  }

  const handleAddOutbound = (outbound: Outbound) => {
    setOutbounds([...outbounds, outbound])
  }

  const handleEditInbound = (index: number) => {
    setEditingItem({ type: 'inbound', index })
  }

  const handleEditOutbound = (index: number) => {
    setEditingItem({ type: 'outbound', index })
  }

  const handleRemoveInbound = (index: number) => {
    if (window.confirm('Are you sure you want to delete this inbound?')) {
      setInbounds(inbounds.filter((_, i) => i !== index))
    }
  }

  const handleRemoveOutbound = (index: number) => {
    if (window.confirm('Are you sure you want to delete this outbound?')) {
      setOutbounds(outbounds.filter((_, i) => i !== index))
    }
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    if (activeSection === 'inbounds') {
      const items = Array.from(inbounds)
      const [reorderedItem] = items.splice(result.source.index, 1)
      items.splice(result.destination.index, 0, reorderedItem)
      setInbounds(items)
    } else if (activeSection === 'outbounds') {
      const items = Array.from(outbounds)
      const [reorderedItem] = items.splice(result.source.index, 1)
      items.splice(result.destination.index, 0, reorderedItem)
      setOutbounds(items)
    }
  }

  const handleSaveConfig = () => {
    const config = {
      inbounds,
      outbounds,
      // Add other sections as they are implemented
    }

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'singbox-config.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const renderItem = (item: any, index: number, type: 'inbound' | 'outbound') => (
    <Draggable key={item.tag} draggableId={item.tag} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {Object.entries(item).map(([key, value]) => (
                <p key={key} className="mb-1">
                  <strong>{key}:</strong> {String(value)}
                </p>
              ))}
            </div>
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => type === 'inbound' ? handleEditInbound(index) : handleEditOutbound(index)}
                className="p-1 text-blue-600 hover:text-blue-800"
                title="Edit"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => type === 'inbound' ? handleRemoveInbound(index) : handleRemoveOutbound(index)}
                className="p-1 text-red-600 hover:text-red-800"
                title="Remove"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Singbox Config Generator
          </h1>
          <button
            onClick={handleSaveConfig}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowDownTrayIcon className="-ml-1 mr-2 h-5 w-5" />
            Save Config
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex w-full items-center space-x-3 rounded-lg px-4 py-3 text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <section.icon className="h-5 w-5" />
                  <span>{section.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="rounded-lg bg-white p-6 shadow">
              {activeSection ? (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {sections.find((s) => s.id === activeSection)?.title}
                  </h2>
                  <div className="mt-4">
                    {activeSection === 'inbounds' ? (
                      <>
                        {editingItem?.type === 'inbound' ? (
                          <AddInbound 
                            onAdd={(inbound) => {
                              const newInbounds = [...inbounds]
                              newInbounds[editingItem.index] = inbound
                              setInbounds(newInbounds)
                              setEditingItem(null)
                            }}
                            onCancel={() => setEditingItem(null)}
                            initialData={inbounds[editingItem.index]}
                          />
                        ) : (
                          <AddInbound 
                            onAdd={handleAddInbound}
                            onCancel={() => {}}
                          />
                        )}
                      </>
                    ) : activeSection === 'outbounds' ? (
                      <>
                        {editingItem?.type === 'outbound' ? (
                          <AddOutbound 
                            onAdd={(outbound) => {
                              const newOutbounds = [...outbounds]
                              newOutbounds[editingItem.index] = outbound
                              setOutbounds(newOutbounds)
                              setEditingItem(null)
                            }}
                            onCancel={() => setEditingItem(null)}
                            initialData={outbounds[editingItem.index]}
                          />
                        ) : (
                          <AddOutbound 
                            onAdd={handleAddOutbound}
                            onCancel={() => {}}
                          />
                        )}
                      </>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                      >
                        <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                        Add New
                      </button>
                    )}
                  </div>
                  {(activeSection === 'inbounds' || activeSection === 'outbounds') && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Current {activeSection === 'inbounds' ? 'Inbounds' : 'Outbounds'}
                      </h3>
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId={activeSection}>
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className="mt-2 space-y-2"
                            >
                              {activeSection === 'inbounds'
                                ? inbounds.map((inbound, index) => renderItem(inbound, index, 'inbound'))
                                : outbounds.map((outbound, index) => renderItem(outbound, index, 'outbound'))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  Select a section to start configuring
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 