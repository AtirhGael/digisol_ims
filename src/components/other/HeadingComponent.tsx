import React from 'react'


interface HeadingComponentProps {
  heading: string
  subHeading?: string
}

export const HeadingComponent = ({ heading, subHeading }: HeadingComponentProps) => {
  return (
    <div>
      <h1 className='text-xl font-bold'>{heading}</h1>
      {subHeading && <h2 className='text-sm opacity-50'>{subHeading}</h2>}
    </div>
  )
}
