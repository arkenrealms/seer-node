import { Model, RelationMappings, JSONSchema } from 'objection'
//import ProjectMember from './project-member'
import Profile from './profile'
import Community from './community'
import Bounty from './bounty'
import Product from './product'
import Idea from './idea'
import Tag from './tag'
import Rating from './rating'
import Node from './node'
import Event from './event'
import Vote from './vote'
import BaseModel from './base'

export default class Project extends BaseModel {
    public parentId!: number
    public score!: number

    public owner!: Profile
    public ownerId!: number

    public rating!: Rating

    public name!: string
    public members!: Array<Profile>
    public isProposal!: boolean

    public tags!: Array<Tag>

    public static get tableName (): string {
        return 'projects'
    }

    public static get timestamps (): boolean {
        return true
    }

    public static get jsonSchema (): JSONSchema {
        return {
            type: 'object',
            required: [],
            properties: {
                contractStatus: {
                    type: 'string',
                    enum: ['Inactive', 'Draft', 'Pending', 'Contributable', 'InDevelopment', 'Refundable', 'Rejected', 'Completed'],
                    default: 'Draft'
                }
            }
        }
    }

    public static get relationMappings (): RelationMappings {
        return {
            // members: {
            //     relation: Model.ManyToManyRelation,
            //     modelClass: Profile,
            //     join: {
            //         from: 'projects.id',
            //         through: {
            //             from: 'project_members.projectId',
            //             to: 'project_members.profileId',
            //             modelClass: ProjectMember,
            //             extra: ['isAdmin']
            //         },
            //         to: 'profiles.id'
            //     }
            // },
            // subprojects: {
            //     relation: Model.HasManyRelation,
            //     modelClass: Project,
            //     join: {
            //         from: 'projects.id',
            //         to: 'projects.parentId'
            //     }
            // },
            // bounties: {
            //     relation: Model.HasManyRelation,
            //     modelClass: Bounty,
            //     join: {
            //         from: 'projects.id',
            //         to: 'bounties.parentId'
            //         // join view through where parentType == 'project'
            //         // https://www.tutorialspoint.com/postgresql/postgresql_views.htm
            //     }
            // },
            owner: {
                relation: Model.BelongsToOneRelation,
                modelClass: Profile,
                join: {
                    from: 'projects.ownerId',
                    to: 'profiles.id'
                }
            },
            vote: {
                relation: Model.ManyToManyRelation,
                modelClass: Vote,
                join: {
                    from: 'projects.id',
                    to: 'votes.id',
                    through: {
                        from: 'nodes.toProjectId',
                        to: 'nodes.fromVoteId',
                        extra: ['relationKey']
                    }
                },
            },
            community: {
                relation: Model.HasOneRelation,
                modelClass: Community,
                join: {
                    from: 'projects.communityId',
                    to: 'communities.id'
                }
            },
            idea: {
                relation: Model.HasOneRelation,
                modelClass: Idea,
                join: {
                    from: 'projects.ideaId',
                    to: 'ideas.id'
                }
            },
            product: {
                relation: Model.HasOneRelation,
                modelClass: Product,
                join: {
                    from: 'projects.productId',
                    to: 'products.id'
                }
            },
            rating: {
                relation: Model.HasOneRelation,
                modelClass: Rating,
                join: {
                    from: 'projects.ratingId',
                    to: 'ratings.id'
                }
            },
            events: {
                relation: Model.ManyToManyRelation,
                modelClass: Event,
                join: {
                    from: 'projects.id',
                    to: 'events.id',
                    through: {
                        from: 'nodes.fromProjectId',
                        to: 'nodes.toEventId',
                        extra: ['relationKey']
                    }
                },
                filter: {
                    relationKey: 'events'
                },
                beforeInsert (model) {
                    (model as Node).relationKey = 'events'
                }
            },
            pledges: {
                relation: Model.ManyToManyRelation,
                modelClass: Profile,
                join: {
                    from: 'projects.id',
                    to: 'profiles.id',
                    through: {
                        from: 'nodes.fromProjectId',
                        to: 'nodes.toProfileId',
                        extra: ['relationKey']
                    }
                },
                filter: {
                    relationKey: 'pledges'
                },
                beforeInsert (model) {
                    (model as Node).relationKey = 'pledges'
                }
            },
            contributors: {
                relation: Model.ManyToManyRelation,
                modelClass: Profile,
                join: {
                    from: 'projects.id',
                    to: 'profiles.id',
                    through: {
                        from: 'nodes.fromProjectId',
                        to: 'nodes.toProfileId',
                        extra: ['relationKey']
                    }
                },
                filter: {
                    relationKey: 'contributors'
                },
                beforeInsert (model) {
                    (model as Node).relationKey = 'contributors'
                }
            },
            moderators: {
                relation: Model.ManyToManyRelation,
                modelClass: Profile,
                join: {
                    from: 'projects.id',
                    to: 'profiles.id',
                    through: {
                        from: 'nodes.fromProjectId',
                        to: 'nodes.toProfileId',
                        extra: ['relationKey']
                    }
                },
                filter: {
                    relationKey: 'moderators'
                },
                beforeInsert (model) {
                    (model as Node).relationKey = 'moderators'
                }
            },
            tags: {
                relation: Model.ManyToManyRelation,
                modelClass: Tag,
                join: {
                    from: 'projects.id',
                    to: 'tags.id',
                    through: {
                        from: 'nodes.fromProjectId',
                        to: 'nodes.toTagId',
                        extra: ['relationKey']
                    }
                },
                filter: {
                    relationKey: 'tags'
                },
                beforeInsert (model) {
                    console.log(model);
                    (model as Node).relationKey = 'tags'
                }
            }
            // has many pledges -> node (parentId = this, parentType = project, nextId = profile.id, nextType = profile)
            // has many contributors -> node (parentId = this, parentType = project, nextId = profile.id, nextType = profile)
            // has many moderators -> node (parentId = this, parentType = project, nextId = profile.id, nextType = profile)
        }
    }

    // static get namedFilters() {
    //     const knex = this.app.get('knex');

    //     return {
    //         incomplete: builder => {
    //         builder
    //             .where('complete', '=', false)
    //             .where('dueDate', '<', knex.fn.now());
    //         }
    //     };
    // }
}
