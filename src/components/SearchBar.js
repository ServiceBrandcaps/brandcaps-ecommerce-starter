import { useRouter } from 'next/router'
import { useState } from 'react'

export default function SearchBar() {
  const [q, setQ] = useState('')
  const router = useRouter()

  const onSubmit = e => {
    e.preventDefault()
    router.push({ pathname: '/search', query: { q } })
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        className="w-full pl-10 pr-4 px-4 py-2 rounded-full text-black focus:outline-none focus:ring-2 focus:ring-blue-400  border border-white bg-white placeholder-black focus:bg-gray-300 transition"
        placeholder="Buscá productos o categorías"
        value={q}
        onChange={e => setQ(e.target.value)}
      />
      {/* <button className="px-4 py-2 bg-black text-white rounded">Buscar</button> */}
    </form>
  )
}
