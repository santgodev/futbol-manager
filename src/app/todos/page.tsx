import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = "force-dynamic";

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = await createClient()

  const { data: todos } = await supabase.from('todos').select()

  return (
    <div className="min-h-screen bg-brand-deep text-brand-text p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-[#02060d]/80 backdrop-blur-xl border border-[#0055cc]/30 p-8 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <h1 className="text-2xl font-bold text-white mb-6 tracking-wide uppercase border-b border-[#00f0ff]/30 pb-3 drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]">
          Lista de Todos
        </h1>
        {(!todos || todos.length === 0) ? (
          <p className="text-white/50 text-sm">No se encontraron tareas en la tabla 'todos'.</p>
        ) : (
          <ul className="space-y-3">
            {todos?.map((todo: any) => (
              <li 
                key={todo.id}
                className="flex items-center gap-3 p-3 bg-[#001122] rounded-lg border border-[#0055cc]/20 hover:border-[#00f0ff]/50 transition-all"
              >
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00f0ff]"></span>
                </span>
                <span className="text-white font-medium">{todo.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
