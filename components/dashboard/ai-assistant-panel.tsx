import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AIAssistantPanelProps {
  onExecute: (command: string) => Promise<void>
  response: { message: string; type: 'success' | 'error' } | null
  loading: boolean
}

export function AIAssistantPanel({ onExecute, response, loading }: AIAssistantPanelProps) {
  const [command, setCommand] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim() || loading) return
    await onExecute(command)
    setCommand('')
  }

  const quickCommands = [
    'Create permission',
    'Create role',
    'List unused permissions',
  ]

  return (
    <aside className="w-[28rem] bg-[#2e3440] border-l border-[#4c566a] flex flex-col shrink-0 transition-all duration-300 relative shadow-xl z-10 mt-16 fixed right-0 top-0 bottom-0">
      <div className="p-4 border-b border-[#4c566a] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-blue-400 p-0.5">
            <div className="w-full h-full rounded-full bg-[#3b4252] flex items-center justify-center">
              <span className="material-icons-round text-primary text-xl">auto_awesome</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#eceff4]">AI Assistant</h3>
            <p className="text-xs text-[#d8dee9]/70">Powered by Gemini</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 text-[#d8dee9]/60 hover:text-primary-light hover:bg-[#434c5e] rounded-full transition-colors">
            <span className="material-icons-round text-lg">delete_outline</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 chat-scroll space-y-6">
        <div className="flex gap-3">
          <div className="flex-1 bg-[#3b4252] rounded-xl rounded-tl-none p-4 shadow-sm border border-[#4c566a]">
            <p className="text-sm text-[#e5e9f0] leading-relaxed font-medium">
              Hey there! <br/><br/>
              Need answers or help with your RBAC configuration? I've got you covered! <br/><br/>
              Just type what you need, and let's dive into making things happen.
            </p>
            <span className="text-[10px] text-[#d8dee9]/50 mt-2 block">
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickCommands.map((cmd, idx) => (
            <button
              key={idx}
              onClick={() => setCommand(cmd)}
              className="px-3 py-1.5 bg-[#3b4252] border border-[#4c566a] rounded-full text-xs font-semibold text-[#e5e9f0] hover:bg-[#434c5e] hover:border-primary/30 transition-all shadow-sm"
            >
              {cmd}
            </button>
          ))}
        </div>

        {response && (
          <div className={`flex gap-3 animate-slide-up ${response.type === 'success' ? '' : ''}`}>
            <div className={`flex-1 rounded-xl rounded-tl-none p-4 shadow-sm border ${
              response.type === 'success'
                ? 'bg-green-900/20 border-green-700/50'
                : 'bg-red-900/20 border-red-700/50'
            }`}>
              <p className={`text-sm leading-relaxed font-medium ${
                response.type === 'success'
                  ? 'text-green-300'
                  : 'text-red-300'
              }`}>
                {response.message}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-[#4c566a] bg-[#2e3440]">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              disabled={loading}
              className="w-full bg-[#3b4252] border border-[#4c566a] text-[#eceff4] rounded-lg py-3 pl-4 pr-12 outline-none text-sm shadow-inner transition-all font-medium placeholder:text-[#d8dee9]/40"
              placeholder="Type here..."
            />
            <button
              type="submit"
              disabled={!command.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary hover:text-primary-light transition-colors rounded-lg hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="material-icons-round text-xl animate-spin">refresh</span>
              ) : (
                <span className="material-icons-round text-xl">send</span>
              )}
            </button>
          </div>
        </form>
        <p className="text-[10px] text-[#d8dee9]/50 text-center mt-2">
          AI can make mistakes. Check important info.
        </p>
      </div>
    </aside>
  )
}
