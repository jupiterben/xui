import { xAlert } from './components/xAlert';
import { xBadge } from './components/xBadge';
import { xButton } from './components/xButton';
import { xConfigProvider } from './components/xConfigProvider';
import { xDivider } from './components/xDivider';
import { xFlex } from './components/xFlex';
import { xGrid } from './components/xGrid';
import { xList } from './components/xList';
import { xPromptInput } from './components/xPromptInput';
import { xSpace } from './components/xSpace';
import { xSwitch } from './components/xSwitch';
import { xTag } from './components/xTag';
import { xThemeDesigner } from './components/xThemeDesigner';
import { xTree } from './components/xTree';
import {
  xTypography,
  xTypographyParagraph,
  xTypographyText,
  xTypographyTitle
} from './components/xTypography';

/** JSX namespace for React (`<x.Button />`) — lowercase `x` exports cannot be used as JSX tags directly. */
export const x = {
  Alert: xAlert,
  Badge: xBadge,
  Button: xButton,
  ConfigProvider: xConfigProvider,
  Divider: xDivider,
  Flex: xFlex,
  Grid: xGrid,
  List: xList,
  PromptInput: xPromptInput,
  Space: xSpace,
  Switch: xSwitch,
  Tag: xTag,
  ThemeDesigner: xThemeDesigner,
  Tree: xTree,
  Typography: xTypography,
  TypographyParagraph: xTypographyParagraph,
  TypographyText: xTypographyText,
  TypographyTitle: xTypographyTitle
};
