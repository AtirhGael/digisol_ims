import React from 'react'

interface carProps {
  heading: string,
  amount?: string,
  icons?: React.ReactNode,
  currency?: string,
  iconBackgroundColor?: string,
  textColor?: string,
  cardBackgroundColor?: string,
  iconContainerClassName?: string,
  iconClassName?: string,
  cardClassName?: string,
  cardStyle?: React.CSSProperties,
  headingClassName?: string,
  amountClassName?: string,
  currencyClassName?: string
}
export const Card = ({
  heading,
  amount,
  icons,
  currency,
  iconBackgroundColor,
  textColor,
  cardBackgroundColor,
  iconContainerClassName,
  iconClassName,
  cardClassName,
  cardStyle,
  headingClassName,
  amountClassName,
  currencyClassName,
}: carProps) => {
  const renderedIcon =
    icons && iconClassName && React.isValidElement(icons)
      ? React.cloneElement(icons as React.ReactElement, {
          className: `${(icons as any).props?.className || ""} ${iconClassName}`.trim(),
        })
      : icons;

  return (
    <div
      className={`p-3 w-full h-31.75 rounded-[20px] flex flex-col gap-3 bg-white ${cardClassName || ""}`.trim()}
      style={{
        ...(cardBackgroundColor ? { backgroundColor: cardBackgroundColor } : {}),
        ...(cardStyle || {}),
      }}
    >
      <div className="flex justify-between">
        <p
          className={`font-medium text-sm ${!textColor ? 'text-gray-900' : ''} ${headingClassName || ''}`.trim()}
          style={textColor ? { color: textColor } : undefined}
        >
          {heading}
        </p>
        {icons && (
          <div
            className={`w-8 h-8 p-2 rounded-[14px] flex items-center justify-center ${iconContainerClassName || ""}`.trim()}
            style={{ backgroundColor: iconBackgroundColor || 'var(--primary)' }}
          >
            <h2>{renderedIcon}</h2>
          </div>
        )}
      </div>
      <div>
        <h2
          className={`text-3xl font-medium ${!textColor ? 'text-gray-900' : ''} ${amountClassName || ''}`.trim()}
          style={textColor ? { color: textColor } : undefined}
        >
          {amount}
        </h2>
        <p
          className={`text-xs mt-1 font-medium ${!textColor ? 'text-primary' : ''} ${currencyClassName || ''}`.trim()}
          style={textColor ? { color: textColor } : undefined}
        >
          {currency}
        </p>
      </div>
    </div>
  );
}
