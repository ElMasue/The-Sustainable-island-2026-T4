import './RefillSearchBar.css';

export type RefillSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function RefillSearchBar({ value, onChange, placeholder = 'Find refill station' }: RefillSearchBarProps) {
  return (
    <div className="refill-search-bar">
      <svg className="refill-search-bar__icon" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.6135 16.25L14.0257 12.5833C14.9227 11.25 15.4934 9.6667 15.4934 7.9167C15.4934 3.58336 11.987 0 7.74666 0C3.5064 0 0 3.58336 0 7.9167C0 12.25 3.5064 15.8334 7.74666 15.8334C9.45908 15.8334 11.0085 15.25 12.3133 14.3333L15.9011 18L17.6135 16.25ZM2.44632 8C2.44632 5.00001 4.8111 2.58334 7.74666 2.58334C10.6822 2.58334 13.0471 5.00001 13.0471 8C13.0471 11 10.6822 13.4167 7.74666 13.4167C4.8111 13.4167 2.44632 11 2.44632 8V8Z" fill="#333333"/>
      </svg>
      <input
        type="text"
        className="refill-search-bar__input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default RefillSearchBar;
