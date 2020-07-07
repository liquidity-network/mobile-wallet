import React from 'react'

interface Props {
  children: React.ReactNode
}

const DefaultModalContent: React.FC<Props> = ({ children }) => <>{children}</>

export default DefaultModalContent
