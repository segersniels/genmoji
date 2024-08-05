import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from 'components/ui/select';
import Style from 'enums/Style';
import { cn } from 'lib/utils';

const STYLE_OPTIONS = [
  {
    display: 'Emoji',
    value: Style.Emoji,
  },
  {
    display: 'Code',
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
    <div>
      <Select
        onValueChange={(value: Style) => setStyle(value)}
        value={style}
        defaultValue={style}
      >
        <SelectTrigger className={cn('w-32', className)}>
          <SelectValue placeholder="Select gitmoji style" />
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            <SelectLabel>Gitmoji Style</SelectLabel>

            {STYLE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.display}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
