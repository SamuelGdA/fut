import { type CountryCode, getCountry, PLAYABLE_COUNTRIES } from "@craque/world";
import { useT } from "../../i18n/useT";
import { Flag } from "../../ui/Media";
import { ChoiceStrip, type ChoiceOption } from "./ChoiceStrip";

interface CountryPickerProps {
  value: CountryCode;
  onValueChange(value: CountryCode): void;
}

/**
 * Os países com liga jogável, como pílulas com bandeira. No celular só a
 * sigla aparece; o nome inteiro vai para o leitor de tela e volta a aparecer
 * a partir de telas médias.
 */
export function CountryPicker({ value, onValueChange }: CountryPickerProps) {
  const { t, locale } = useT();

  const options: ChoiceOption<CountryCode>[] = PLAYABLE_COUNTRIES.flatMap((code) => {
    const country = getCountry(code);
    if (!country) return [];
    const name = country.names[locale];
    return [
      {
        value: code,
        ariaLabel: name,
        icon: <Flag country={country} size={20} language={locale} decorative />,
        label: (
          <>
            <span className="sm:hidden">{code}</span>
            <span className="hidden sm:inline">{name}</span>
          </>
        ),
      },
    ];
  });

  return <ChoiceStrip value={value} onValueChange={onValueChange} options={options} label={t("lab.world.country")} />;
}
