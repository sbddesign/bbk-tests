import { BuiAvatarReact as BuiAvatar } from '@sbddesign/bui-ui/react'

interface RecipientProps {
  size?: 'Large' | 'Small'
}

function Recipient({ size = 'Large' }: RecipientProps) {
  const name = import.meta.env.VITE_TIP_JAR_NAME || 'Yes, And! Improv Tip Jar'
  const slogan = import.meta.env.VITE_TIP_JAR_SLOGAN || 'Fuel the funny — throw some sats!'

  const nameElement = (
    <div className="text-center">
      <h1 className="text-2xl font-bold">{name}</h1>
      <p className="text-sm opacity-80">{slogan}</p>
    </div>
  )

  if (size === 'Small') {
    return (
      <div className="flex items-center gap-3">
        <BuiAvatar size="small" />
        {nameElement}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <BuiAvatar size="large" />
      {nameElement}
    </div>
  )
}

export default function RecipientComponent() {
  return <Recipient />
}

export { Recipient }


