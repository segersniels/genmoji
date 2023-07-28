'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'components/ui/select';
import Style from 'enums/Style';
import { cn } from 'lib/utils';

const STYLE_OPTIONS = [
  {
    display: '👋',
    value: Style.Emoji,
  },
  {
    display: ':code:',
    value: Style.Code,
  },
];

interface Props {
  className?: string;
  style: Style;
  setStyle: (style: Style) => void;
}

export default function StyleSelect(props: Props) {
  const { className, style, setStyle } = props;

  return (
    <Select
      onValueChange={(value: Style) => setStyle(value)}
      value={style}
      defaultValue={style}
    >
      <SelectTrigger className={cn('w-auto', className)}>
        <SelectValue placeholder={style} />
      </SelectTrigger>
      <SelectContent>
        {STYLE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.display}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
