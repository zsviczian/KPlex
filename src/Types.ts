import { Page } from "./graph/Page";

export enum RelationType {
  DEFINED = 1,
  INFERRED = 2
}

export enum Role {
  PARENT,
  CHILD,
  LEFT,
  RIGHT,
}

export enum LinkDirection {
  TO = 1,
  FROM = 2,
  BOTH = 3,
}

export type Relation = {
  target: Page;
  direction: LinkDirection;
  isHidden: boolean;
  isParent: boolean;
  parentType?: RelationType;
  parentTypeDefinition?: string;
  isChild: boolean;
  childType?: RelationType;
  childTypeDefinition?: string;
  isLeftFriend: boolean;
  leftFriendType?: RelationType;
  leftFriendTypeDefinition?: string;
  isRightFriend: boolean;
  rightFriendType?: RelationType;
  rightFriendTypeDefinition?: string;
  isNextFriend: boolean;
  nextFriendType?: RelationType;
  nextFriendTypeDefinition?: string;
  isPreviousFriend: boolean;
  previousFriendType?: RelationType;
  previousFriendTypeDefinition?: string;
}

export type Hierarchy = {
  hidden: string[],
  parents: string[],
  children: string[],
  leftFriends: string[],
  rightFriends: string[],
  previous: string[],
  next: string[],
  exclusions: string[],
}

export type Neighbour = {
  page: Page;
  relationType: RelationType;
  typeDefinition: string;
  linkDirection: LinkDirection;
}

export type LayoutSpecification = {
  columns: number;
  origoX: number;
  origoY: number;
  top: number;
  bottom: number;
  rowHeight: number;
  columnWidth: number;
  maxLabelLength: number;
}

export type Dimensions = {width:number, height:number};

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};