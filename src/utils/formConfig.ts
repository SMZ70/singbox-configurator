import yaml from 'js-yaml'

export interface FormField {
    name: string
    label: string
    type: 'text' | 'number' | 'password' | 'select' | 'boolean' | 'array' | 'object'
    required: boolean
    pattern?: string
    default?: any
    min?: number
    max?: number
    options?: string[] | { [key: string]: string }
    description?: string
    order?: number
    depends_on?: {
        field: string
        value: any
    }
    fields?: FormField[] // For array and object types
    item_type?: 'object' | 'text' | 'number' // For array type
    $ref?: string // Reference to a schema
}

export interface FormConfig {
    base_fields: FormField[]
    type_fields: {
        [key: string]: FormField[]
    }
}

export interface FormConfigs {
    schemas?: { [key: string]: FormField }
    inbound: FormConfig
    outbound: FormConfig
}

let formConfigs: FormConfigs | null = null

function resolveSchemaRef(field: FormField, schemas: { [key: string]: FormField }): FormField {
    if (!field.$ref) return field

    // Extract schema path from reference (e.g., "#/schemas/tls" -> "tls")
    const schemaPath = field.$ref.split('/').pop()
    if (!schemaPath || !schemas[schemaPath]) {
        throw new Error(`Invalid schema reference: ${field.$ref}`)
    }

    // Merge the referenced schema with any overrides from the field
    const schema = schemas[schemaPath]
    return {
        ...schema,
        ...field,
        $ref: undefined // Remove the reference to prevent infinite recursion
    }
}

export async function loadFormConfigs(): Promise<FormConfigs> {
    if (formConfigs) return formConfigs

    try {
        // Try loading from the public directory first
        let response = await fetch('./forms.yaml')

        // If that fails, try loading from the root directory
        if (!response.ok) {
            console.log('Failed to load from public directory, trying root directory...');
            response = await fetch('/forms.yaml')
        }

        if (!response.ok) {
            throw new Error(`Failed to load forms.yaml: ${response.status} ${response.statusText}`)
        }

        const yamlText = await response.text()
        console.log('Loaded YAML text:', yamlText.substring(0, 100) + '...')
        const config = yaml.load(yamlText) as FormConfigs
        console.log('Parsed config:', config)

        // Resolve schema references
        if (config.schemas) {
            // Process inbound type fields
            Object.keys(config.inbound.type_fields).forEach(type => {
                config.inbound.type_fields[type] = config.inbound.type_fields[type].map(field =>
                    resolveSchemaRef(field, config.schemas!)
                )
            })

            // Process outbound type fields
            Object.keys(config.outbound.type_fields).forEach(type => {
                config.outbound.type_fields[type] = config.outbound.type_fields[type].map(field =>
                    resolveSchemaRef(field, config.schemas!)
                )
            })
        }

        formConfigs = config
        return config
    } catch (error) {
        console.error('Error loading form configs:', error)
        throw error
    }
}

export function getFieldsForType(config: FormConfig, type: string): FormField[] {
    // Get type-specific fields
    const typeFields = config.type_fields[type] || []

    // Sort fields by order
    return typeFields.sort((a, b) => (a.order || 0) - (b.order || 0))
}

export function validateField(field: FormField, value: any): string | null {
    if (field.required && (value === undefined || value === null || value === '')) {
        return `${field.label} is required`
    }

    if (field.pattern && value && !new RegExp(field.pattern).test(value)) {
        return `${field.label} has invalid format`
    }

    if (field.type === 'number') {
        const num = Number(value)
        if (isNaN(num)) {
            return `${field.label} must be a number`
        }
        if (field.min !== undefined && num < field.min) {
            return `${field.label} must be at least ${field.min}`
        }
        if (field.max !== undefined && num > field.max) {
            return `${field.label} must be at most ${field.max}`
        }
    }

    return null
}

export function getDefaultValue(field: FormField): any {
    if (field.default !== undefined) {
        return field.default
    }

    switch (field.type) {
        case 'text':
        case 'password':
            return ''
        case 'number':
            return 0
        case 'boolean':
            return false
        case 'array':
            return []
        case 'object':
            return {}
        case 'select':
            return Array.isArray(field.options) ? field.options[0] : ''
        default:
            return null
    }
}

export function isFieldVisible(field: FormField, formData: any): boolean {
    if (!field.depends_on) return true

    const [parent, child] = field.depends_on.field.split('.')
    let parentValue = formData[parent]

    // Handle nested objects
    if (child && typeof parentValue === 'object') {
        parentValue = parentValue[child]
    }

    return parentValue === field.depends_on.value
} 