import React from 'react'

interface progressProps {
  percentage: number,
  heading: string,
  subHeading: string,
}
export const ProgressBar = ({heading, subHeading, percentage}: progressProps) => {
  return (
    <div className='mt-2'>
      <div className='flex justify-between'>
        <p>{heading}</p>
        <p>{subHeading}</p>
      </div>
      <div className='mt-1'>
        <div className='w-full rounded-full h-2 bg-gray-200'>
          <div className={'h-full rounded-full bg-primary'} style={{width: `${percentage}%`}}></div>
        </div>
      </div>
    </div>
  )
}
