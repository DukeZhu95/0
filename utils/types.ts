import { IoniconName } from "./IconTypes";


// Define a type for the menu options
export type MenuOption = {
  id: string;
  title: string;
  icon: IoniconName;
  onPress: () => void;
};
