import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css";

type PlacesProps = {
  setHouse: (position: google.maps.LatLngLiteral) => void;
  fetchDirections: (house: google.maps.LatLngLiteral) => void;
};

export default function Places({ setHouse, fetchDirections }: PlacesProps) {
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete();


  const handleSelect = async (address: string) => {
    setValue(address, false);
    clearSuggestions();

    const results = await getGeocode({ address });
    const { lat, lng } = await getLatLng(results[0]);
    setHouse({ lat, lng });
    fetchDirections({ lat, lng });
  };

  return (
    <Combobox onSelect={handleSelect}>
      <ComboboxInput 
        value={value} 
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setValue(e.target.value);
        }} 
        className="combobox-input" 
        placeholder="Search your Home address" 
      />
      <ComboboxPopover>
        <ComboboxList>
          {status === "OK" && data.map(({ place_id, description }) => (
            <ComboboxOption key={place_id} value={description} />
          ))}
        </ComboboxList>
      </ComboboxPopover>
    </Combobox>
  );
}
