'use client'

import { IconWorld } from '@tabler/icons-react'
import * as React from 'react'
import { createContext, useContext, useMemo, useState } from 'react'
import * as BasePhoneInput from 'react-phone-number-input'
import flags from 'react-phone-number-input/flags'

import { cn } from '@/registry/lib/utils'
import { Button } from '@/registry/primitives/button'
import {
  Combobox,
  ComboboxPopup,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
} from '@/registry/primitives/combobox'
import { Input } from '@/registry/primitives/input'
import { ScrollArea } from '@/registry/primitives/scroll-area'

type PhoneInputSize = 'sm' | 'default' | 'lg'

const PhoneInputContext = createContext<{
  variant: PhoneInputSize
  popupClassName?: string
  scrollAreaClassName?: string
}>({
  variant: 'default',
  popupClassName: undefined,
  scrollAreaClassName: undefined,
})

type PhoneInputProps = Omit<React.ComponentProps<'input'>, 'onChange' | 'value' | 'ref'> &
  Omit<
    BasePhoneInput.Props<typeof BasePhoneInput.default>,
    'onChange' | 'variant' | 'popupClassName' | 'scrollAreaClassName' | 'ref'
  > & {
    onChange?: (value: BasePhoneInput.Value) => void
    variant?: PhoneInputSize
    popupClassName?: string
    scrollAreaClassName?: string
  }

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  { className, variant, popupClassName, scrollAreaClassName, onChange, value, ...props },
  ref,
) {
  const phoneInputSize = variant || 'default'

  const contextValue = useMemo(
    () => ({ variant: phoneInputSize, popupClassName, scrollAreaClassName }),
    [phoneInputSize, popupClassName, scrollAreaClassName],
  )

  return (
    <PhoneInputContext.Provider value={contextValue}>
      <BasePhoneInput.default
        ref={ref}
        className={cn(
          'flex',
          props['aria-invalid'] &&
            '[&_*[data-slot=combobox-trigger]]:border-destructive [&_*[data-slot=combobox-trigger]]:ring-destructive/50',
          className,
        )}
        flagComponent={FlagComponent}
        countrySelectComponent={CountrySelect}
        inputComponent={InputComponent}
        smartCaret={false}
        value={value || undefined}
        onChange={(value) => onChange?.(value || ('' as BasePhoneInput.Value))}
        {...props}
      />
    </PhoneInputContext.Provider>
  )
})
PhoneInput.displayName = 'PhoneInput'

const InputComponent = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(function InputComponent(
  { className, ...props },
  ref,
) {
  const { variant } = useContext(PhoneInputContext)

  return (
    <Input
      ref={ref}
      className={cn(
        'ring-none! rounded-s-none outline-none! focus:z-1',
        variant === 'sm' && 'h-7',
        variant === 'lg' && 'h-9',
        className,
      )}
      {...props}
    />
  )
})
InputComponent.displayName = 'InputComponent'

type CountryEntry = {
  label: string
  value: BasePhoneInput.Country | undefined
}

type CountrySelectProps = {
  disabled?: boolean
  value: BasePhoneInput.Country
  options: CountryEntry[]
  onChange: (country: BasePhoneInput.Country) => void
}

function CountrySelect({ disabled, value: selectedCountry, options: countryList, onChange }: CountrySelectProps) {
  const { variant, popupClassName } = useContext(PhoneInputContext)
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const filteredCountries = useMemo(() => {
    if (!searchValue.trim()) return countryList

    const query = searchValue.trim().toLowerCase()
    const normalizedQuery = query.startsWith('+') ? query.slice(1) : query

    return countryList
      .map((item) => {
        if (!item.value) return { item, score: 0 }

        const labelLower = item.label.toLowerCase()
        const isoCodeLower = item.value.toLowerCase()
        let callingCode = ''

        try {
          callingCode = BasePhoneInput.getCountryCallingCode(item.value)
        } catch {
          // ignore invalid country code
        }

        let score = 0
        if (callingCode === normalizedQuery) {
          score = 100
        } else if (callingCode.startsWith(normalizedQuery)) {
          score = 80
        } else if (isoCodeLower === normalizedQuery) {
          score = 90
        } else if (labelLower.startsWith(query)) {
          score = 70
        } else if (labelLower.includes(query)) {
          score = 50
        } else if (callingCode.includes(normalizedQuery)) {
          score = 40
        }

        return { item, score }
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item)
  }, [countryList, searchValue])

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setSearchValue('')
    }
  }

  return (
    <Combobox
      open={open}
      onOpenChange={handleOpenChange}
      items={filteredCountries}
      value={selectedCountry || ''}
      onValueChange={(country: BasePhoneInput.Country | null) => {
        if (country) {
          onChange(country)
          setOpen(false)
          setSearchValue('')
        }
      }}
    >
      <ComboboxTrigger
        render={
          <Button
            variant="outline"
            size={variant}
            className={cn(
              'rounded-s-lg rounded-e-none flex gap-1 border-e-0 px-2.5 py-0 leading-none hover:bg-transparent focus:z-10 data-pressed:bg-transparent',
              disabled && 'opacity-50',
            )}
            disabled={disabled}
          >
            <span className="sr-only">
              <ComboboxValue />
            </span>
            <FlagComponent country={selectedCountry} countryName={selectedCountry} />
          </Button>
        }
      />
      <ComboboxPopup className={cn('w-xs *:data-[slot=input-group]:bg-transparent', popupClassName)}>
        <ComboboxInput
          placeholder="Search country or +code..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          showTrigger={false}
          className="border-input focus-visible:border-border rounded-none border-0 px-0 py-2.5 shadow-none ring-0! outline-none! focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <ComboboxSeparator />
        <ComboboxEmpty className="px-4 py-2.5 text-sm">No country found.</ComboboxEmpty>
        <ComboboxList>
          <div className="relative flex max-h-full">
            <div className="flex max-h-[min(var(--available-height),24rem)] w-full scroll-pt-2 scroll-pb-2 flex-col overscroll-contain">
              <ScrollArea className="size-full min-h-0 **:data-[slot=scroll-area-scrollbar]:m-0 [&_[data-slot=scroll-area-viewport]]:h-full [&_[data-slot=scroll-area-viewport]]:overscroll-contain">
                {filteredCountries.map((item: CountryEntry) =>
                  item.value ? (
                    <ComboboxItem key={item.value} value={item.value} className="flex items-center gap-2">
                      <FlagComponent country={item.value} countryName={item.label} />
                      <span className="flex-1 text-sm">{item.label}</span>
                      <span className="text-foreground/50 text-sm">
                        {`+${BasePhoneInput.getCountryCallingCode(item.value)}`}
                      </span>
                    </ComboboxItem>
                  ) : null,
                )}
              </ScrollArea>
            </div>
          </div>
        </ComboboxList>
      </ComboboxPopup>
    </Combobox>
  )
}

function FlagComponent({ country, countryName }: BasePhoneInput.FlagProps) {
  const Flag = flags[country]

  return (
    <span className="flex h-4 w-4 items-center justify-center [&_svg:not([class*='size-'])]:size-full! [&_svg:not([class*='size-'])]:rounded-[5px]">
      {Flag ? <Flag title={countryName} /> : <IconWorld className="size-4 opacity-60" />}
    </span>
  )
}

export { PhoneInput, type PhoneInputProps, type PhoneInputSize }

export {
  formatPhoneNumber,
  formatPhoneNumberIntl,
  isPossiblePhoneNumber,
  isValidPhoneNumber,
  getCountryCallingCode,
} from 'react-phone-number-input'
