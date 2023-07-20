import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Item = {
  __typename?: 'Item';
  description: Scalars['String']['output'];
  itemId: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type Persona = {
  __typename?: 'Persona';
  arcana: Scalars['String']['output'];
  baseLevel: Scalars['Int']['output'];
  dlc: Scalars['Boolean']['output'];
  elementals: Array<Scalars['String']['output']>;
  fusionAlarmItem?: Maybe<Item>;
  fusionAlarmSkillCard?: Maybe<Skill>;
  inheritanceType?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  normalItem?: Maybe<Item>;
  normalSkillCard?: Maybe<Skill>;
  personaId: Scalars['Int']['output'];
  skills: Array<PersonaSkill>;
  special: Scalars['Boolean']['output'];
  stats: Array<Scalars['Int']['output']>;
  treasure: Scalars['Boolean']['output'];
  treasureMods?: Maybe<Array<Maybe<TreasureMod>>>;
};

export type PersonaRecipe = {
  __typename?: 'PersonaRecipe';
  persona1: Persona;
  persona2: Persona;
};

export type PersonaSkill = {
  __typename?: 'PersonaSkill';
  level: Scalars['Int']['output'];
  skill: Skill;
};

export type Query = {
  __typename?: 'Query';
  allItems: Array<Item>;
  allPersonas: Array<Persona>;
  allSkills: Array<Maybe<Skill>>;
  getPersonaFusionById?: Maybe<Persona>;
  getPersonaFusionByName?: Maybe<Persona>;
  getPersonaRecipesById: Array<Maybe<PersonaRecipe>>;
  itemById?: Maybe<Item>;
  itemByName: Array<Maybe<Item>>;
  personaById?: Maybe<Persona>;
  personaByName: Array<Maybe<Persona>>;
  skillById?: Maybe<Skill>;
  skillByName: Array<Maybe<Skill>>;
};


export type QueryAllPersonasArgs = {
  dlc: Scalars['Boolean']['input'];
};


export type QueryGetPersonaFusionByIdArgs = {
  dlc: Scalars['Boolean']['input'];
  persona1Id: Scalars['Int']['input'];
  persona2Id: Scalars['Int']['input'];
};


export type QueryGetPersonaFusionByNameArgs = {
  dlc: Scalars['Boolean']['input'];
  persona1Name: Scalars['String']['input'];
  persona2Name: Scalars['String']['input'];
};


export type QueryGetPersonaRecipesByIdArgs = {
  dlc: Scalars['Boolean']['input'];
  personaId: Scalars['Int']['input'];
};


export type QueryItemByIdArgs = {
  itemId: Scalars['Int']['input'];
};


export type QueryItemByNameArgs = {
  name: Scalars['String']['input'];
};


export type QueryPersonaByIdArgs = {
  personaId: Scalars['Int']['input'];
};


export type QueryPersonaByNameArgs = {
  dlc: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
};


export type QuerySkillByIdArgs = {
  skillId: Scalars['Int']['input'];
};


export type QuerySkillByNameArgs = {
  name: Scalars['String']['input'];
};

export type Skill = {
  __typename?: 'Skill';
  cost?: Maybe<Scalars['Int']['output']>;
  effect: Scalars['String']['output'];
  name: Scalars['String']['output'];
  skillId: Scalars['Int']['output'];
  type: Scalars['String']['output'];
};

export type TreasureMod = {
  __typename?: 'TreasureMod';
  arcana: Scalars['String']['output'];
  modifier: Scalars['Int']['output'];
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Item: ResolverTypeWrapper<Item>;
  Persona: ResolverTypeWrapper<Persona>;
  PersonaRecipe: ResolverTypeWrapper<PersonaRecipe>;
  PersonaSkill: ResolverTypeWrapper<PersonaSkill>;
  Query: ResolverTypeWrapper<{}>;
  Skill: ResolverTypeWrapper<Skill>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  TreasureMod: ResolverTypeWrapper<TreasureMod>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars['Boolean']['output'];
  Int: Scalars['Int']['output'];
  Item: Item;
  Persona: Persona;
  PersonaRecipe: PersonaRecipe;
  PersonaSkill: PersonaSkill;
  Query: {};
  Skill: Skill;
  String: Scalars['String']['output'];
  TreasureMod: TreasureMod;
}>;

export type ItemResolvers<ContextType = any, ParentType extends ResolversParentTypes['Item'] = ResolversParentTypes['Item']> = ResolversObject<{
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  itemId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PersonaResolvers<ContextType = any, ParentType extends ResolversParentTypes['Persona'] = ResolversParentTypes['Persona']> = ResolversObject<{
  arcana?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  baseLevel?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  dlc?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  elementals?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  fusionAlarmItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType>;
  fusionAlarmSkillCard?: Resolver<Maybe<ResolversTypes['Skill']>, ParentType, ContextType>;
  inheritanceType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  normalItem?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType>;
  normalSkillCard?: Resolver<Maybe<ResolversTypes['Skill']>, ParentType, ContextType>;
  personaId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  skills?: Resolver<Array<ResolversTypes['PersonaSkill']>, ParentType, ContextType>;
  special?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  stats?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  treasure?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  treasureMods?: Resolver<Maybe<Array<Maybe<ResolversTypes['TreasureMod']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PersonaRecipeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PersonaRecipe'] = ResolversParentTypes['PersonaRecipe']> = ResolversObject<{
  persona1?: Resolver<ResolversTypes['Persona'], ParentType, ContextType>;
  persona2?: Resolver<ResolversTypes['Persona'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PersonaSkillResolvers<ContextType = any, ParentType extends ResolversParentTypes['PersonaSkill'] = ResolversParentTypes['PersonaSkill']> = ResolversObject<{
  level?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  skill?: Resolver<ResolversTypes['Skill'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  allItems?: Resolver<Array<ResolversTypes['Item']>, ParentType, ContextType>;
  allPersonas?: Resolver<Array<ResolversTypes['Persona']>, ParentType, ContextType, RequireFields<QueryAllPersonasArgs, 'dlc'>>;
  allSkills?: Resolver<Array<Maybe<ResolversTypes['Skill']>>, ParentType, ContextType>;
  getPersonaFusionById?: Resolver<Maybe<ResolversTypes['Persona']>, ParentType, ContextType, RequireFields<QueryGetPersonaFusionByIdArgs, 'dlc' | 'persona1Id' | 'persona2Id'>>;
  getPersonaFusionByName?: Resolver<Maybe<ResolversTypes['Persona']>, ParentType, ContextType, RequireFields<QueryGetPersonaFusionByNameArgs, 'dlc' | 'persona1Name' | 'persona2Name'>>;
  getPersonaRecipesById?: Resolver<Array<Maybe<ResolversTypes['PersonaRecipe']>>, ParentType, ContextType, RequireFields<QueryGetPersonaRecipesByIdArgs, 'dlc' | 'personaId'>>;
  itemById?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<QueryItemByIdArgs, 'itemId'>>;
  itemByName?: Resolver<Array<Maybe<ResolversTypes['Item']>>, ParentType, ContextType, RequireFields<QueryItemByNameArgs, 'name'>>;
  personaById?: Resolver<Maybe<ResolversTypes['Persona']>, ParentType, ContextType, RequireFields<QueryPersonaByIdArgs, 'personaId'>>;
  personaByName?: Resolver<Array<Maybe<ResolversTypes['Persona']>>, ParentType, ContextType, RequireFields<QueryPersonaByNameArgs, 'dlc' | 'name'>>;
  skillById?: Resolver<Maybe<ResolversTypes['Skill']>, ParentType, ContextType, RequireFields<QuerySkillByIdArgs, 'skillId'>>;
  skillByName?: Resolver<Array<Maybe<ResolversTypes['Skill']>>, ParentType, ContextType, RequireFields<QuerySkillByNameArgs, 'name'>>;
}>;

export type SkillResolvers<ContextType = any, ParentType extends ResolversParentTypes['Skill'] = ResolversParentTypes['Skill']> = ResolversObject<{
  cost?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  effect?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  skillId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TreasureModResolvers<ContextType = any, ParentType extends ResolversParentTypes['TreasureMod'] = ResolversParentTypes['TreasureMod']> = ResolversObject<{
  arcana?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  modifier?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  Item?: ItemResolvers<ContextType>;
  Persona?: PersonaResolvers<ContextType>;
  PersonaRecipe?: PersonaRecipeResolvers<ContextType>;
  PersonaSkill?: PersonaSkillResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Skill?: SkillResolvers<ContextType>;
  TreasureMod?: TreasureModResolvers<ContextType>;
}>;

