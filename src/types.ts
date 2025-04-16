export type InboundType = 'http' | 'socks' | 'shadowsocks' | 'vmess' | 'trojan' | 'hysteria'
export type OutboundType = 'direct' | 'block' | 'socks' | 'http' | 'shadowsocks' | 'vmess' | 'trojan' | 'hysteria'

export interface InboundConfig {
    type: InboundType
    tag: string
    listen: string
    listen_port: number
    users?: Array<{
        username: string
        password: string
    }>
    tls?: {
        enabled: boolean
        server_name?: string
        certificate_path?: string
        key_path?: string
    }
}

export interface OutboundConfig {
    type: OutboundType
    tag: string
    server?: string
    server_port?: number
    method?: string
    password?: string
    uuid?: string
    tls?: {
        enabled: boolean
        server_name?: string
        insecure?: boolean
    }
}

export interface ConfigState {
    inbounds: InboundConfig[]
    outbounds: OutboundConfig[]
} 