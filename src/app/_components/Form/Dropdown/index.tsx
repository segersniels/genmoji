import { useCallback, useState } from 'react';
import { AiOutlineDown } from 'react-icons/ai';

import styles from './styles.module.css';

interface Value {
  display: string;
  value: string;
}

interface Props<T extends Value> {
  className?: string;
  value: string;
  options: T[];
  onChange: (value: T) => void;
}

export default function Dropdown<T extends Value>(props: Props<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = useCallback(
    (value: T) => {
      props.onChange(value);
      setIsOpen(false);
    },
    [props]
  );

  if (!props.value) {
    return;
  }

  return (
    <div className={props.className ?? 'flex'}>
      <button
        className={styles.button}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        {props.options.find((option) => option.value === props.value)!.display}
        <AiOutlineDown className="ml-2 stroke-[4rem]" />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <ul className={styles.list}>
            {props.options.map((option) => (
              <li key={option.display} onClick={() => handleChange(option)}>
                <p className={styles.item}>{option.display}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
