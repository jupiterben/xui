import { xAlert } from './xAlert';
import { xBadge } from './xBadge';
import { xButton } from './xButton';
import { xConfigProvider } from './xConfigProvider';
import { xDivider } from './xDivider';
import { xFlex } from './xFlex';
import { xGrid } from './xGrid';
import { xList } from './xList';
import { xPromptInput } from './xPromptInput';
import { xSpace } from './xSpace';
import { xSwitch } from './xSwitch';
import { xTag } from './xTag';
import { xThemeDesigner } from './xThemeDesigner';
import { xTree } from './xTree';
import { xTypography, xTypographyParagraph, xTypographyText, xTypographyTitle } from './xTypography';

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
