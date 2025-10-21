const { playAnim, playSoundAll } = require('../../basic')

/**
 * @type {TrickModule}
 */
module.exports = {
    sid: 'rgb39.weapon.highground_greatsword',
    bind: [ 'weapon:highground_greatsword', 'weapon:highground_greatsword_royal' ],
    entry: 'blocking',
    moves: {
        blocking: {
            cast: Infinity,
            onEnter(pl) {
                playAnimCompatibility(pl, 'animation.highground.blocking.hold', 'animation.highground.blocking.hold')
            },
            transitions: {
                // changePosture: {
                //     onSneak: {
                //         isSneaking: true
                //     }
                // },
                dodgeBlocking: {
                    onSneak: null
                },
                attack1: {
                    onAttack: null
                },
                hlitStrike: {
                    onUseItem: null
                },
                hit: {
                    onHurt: null
                },
                knockdown: {
                    onKnockdown: null
                },
            }
        },

        hlitStrike: {
            cast: 9,
            backswing: 4,
            onEnter(pl, ctx) {
                ctx.lookAtTarget(pl)
                ctx.freeze(pl)
                ctx.status.isWaitingParry = true
                if (ctx.distanceToTarget(pl) > 2) {
                    ctx.setVelocity(pl, 90, 0.8, 0)
                }
                ctx.task
                    .queue(() => {
                        ctx.status.isWaitingParry = false
                    }, 200)
                    .queue(() => {
                        if (ctx.distanceToTarget(pl) < 2) {
                            return
                        }
                        ctx.setVelocity(pl, 90, 0.8, 0)
                    }, 200)
                    .run()
                playAnimCompatibility(pl, 'animation.highground.blocking.hlit.strike')
            },
            onAct(pl, ctx) {
                ctx.selectFromSector(pl, {
                    radius: 2.5,
                    angle: 30,
                    rotation: 15
                }).forEach(en => {
                    ctx.attack(pl, en, {
                        damage: 8,
                        knockback: 1.6,
                    })
                })
            },
            onLeave(_, ctx) {
                ctx.task.cancel()
            },
            transitions: {
                h2blocking: {
                    onEndOfLife: null
                },
                hit: {
                    onHurt: {
                        allowedState: 'both'
                    }
                },
                parry: {
                    onParry: {
                        allowedState: 'both'
                    }
                },
                parried: {
                    onParried: {
                        allowedState: 'both'
                    }
                },
                knockdown: {
                    onKnockdown: {
                        allowedState: 'both'
                    }
                },
            }
        },

        parry: {
            cast: 10,
            backswing: 4,
            onEnter(pl, ctx) {
                playSoundAll('weapon.parry', pl.pos, 1)
                ctx.freeze(pl)
                playAnimCompatibility(pl, 'animation.highground.blocking.parry')
                ctx.setVelocity(pl, 90, 0.5, 0)
                const opponent = ctx.rawArgs[1]
                ctx.adsorbTo(pl, opponent)
            },
            onLeave(pl, ctx) {
                ctx.status.isWaitingParry = false
            },
            timeline: {
                12: (pl, ctx) => ctx.trap(pl)
            },
            transitions: {
                counter: {
                    onTrap: {
                        preInput: 'onUseItem',
                        allowedState: 'backswing'
                    },
                },
                transFlexible: {
                    onEndOfLife: null
                },
                knockdown: {
                    onKnockdown: {
                        allowedState: 'both'
                    }
                },
            }
        },

        counter: {
            cast: 9,
            backswing: 15,
            onEnter(pl, ctx) {
                ctx.setVelocity(pl, 90, 1, 0)
                playAnimCompatibility(pl, 'animation.highground.parry.counter.strong')
                ctx.adsorbToTarget(pl, 10)
            },
            onAct(pl, ctx) {
                ctx.selectFromSector(pl, {
                    radius: 3.2,
                    angle: 60,
                    rotation: -30
                }).forEach(e => {
                    ctx.attack(pl, e, {
                        knockback: 3,
                        damage: 20,
                        permeable: true
                    })
                })
            },
            onLeave(pl, ctx) {
                ctx.unfreeze(pl)
            },
            transitions: {
                strongMode: {
                    onEndOfLife: null
                },
                knockdown: {
                    onKnockdown: {
                        allowedState: 'both'
                    }
                },
            }
        },

        transFlexible: {
            cast: 8,
            onEnter(pl) {
                playAnimCompatibility(pl, 'animation.highground.parry.trans.flexible')
            },
            onLeave(pl, ctx) {
                ctx.unfreeze(pl)
            },
            transitions: {
                flexibleMode: {
                    onEndOfLife: null
                }
            }
        },

        h2blocking: {
            cast: 3,
            onEnter(pl) {
                playAnimCompatibility(pl, 'animation.highground.hlit.strike.blocking')
            },
            onLeave(pl, ctx) {
                ctx.unfreeze(pl)
            },
            transitions: {
                blocking: {
                    onEndOfLife: null
                }
            }
        },

        attack1: {
            cast: 10,
            backswing: 3,
            onEnter(pl, ctx) {
                ctx.status.isBlocking = true
                playAnimCompatibility(pl, 'animation.highground.blocking.attack1')
                ctx.freeze(pl)
                if (ctx.distanceToTarget(pl) > 2) {
                    ctx.setVelocity(pl, 90, 0.5, 0)
                }
                ctx.task.queue(() => {
                    if (ctx.distanceToTarget(pl) > 2) {
                        ctx.setVelocity(pl, 120, 0.7, 0)
                    }
                }, 440)
                .run()
            },
            onAct(pl, ctx) {
                ctx.status.isBlocking = false
                ctx.selectFromSector(pl, {
                    radius: 3,
                    angle: 80,
                    rotation: 10
                }).forEach(e => {
                    ctx.attack(pl, e, {
                        damage: 12,
                        knockback: 1.2,
                    })
                })
            },
            onLeave(pl, ctx) {
                ctx.task.cancel()
                ctx.unfreeze(pl)
                ctx.status.isBlocking = false
            },
            timeline: {
                8: (pl, ctx) => ctx.trap(pl),
            },
            transitions: {
                attackCombo: {
                    onEndOfLife: null
                },
                hit: {
                    onHurt: {
                        allowedState: 'both'
                    }
                },
                parried: {
                    onParried: {
                        allowedState: 'both'
                    }
                },
                knockdown: {
                    onKnockdown: {
                        allowedState: 'both'
                    }
                },
                blocking: {
                    onTrap: {
                        preInput: 'onFeint'
                    }
                },
                strikeBack: {
                    onBlock: {
                        allowedState: 'both'
                    }
                },
                blocked: {
                    onBlocked: {
                        allowedState: 'backswing'
                    }
                }
            }
        },

        strikeBack: {
            cast: 5,
            backswing: 8,
            onEnter(pl, ctx) {
                ctx.freeze(pl)
                ctx.adsorbOrSetVelocity(pl, 2, 90)
                playAnimCompatibility(pl, 'animation.highground.blocking.strike_back')
            },
            onAct(pl, ctx) {
                ctx.selectFromSector(pl, {
                    radius: 3,
                    angle: 45,
                    rotation: -22.5
                }).forEach(en => {
                    ctx.attack(pl, en, {
                        damage: 20,
                        permeable: true,
                        knockback: 1
                    })
                })
                ctx.setVelocity(pl, -90, 1.5, 0)
            },
            onLeave(pl, ctx) {
                ctx.unfreeze(pl)
            },
            transitions: {
                strongMode: {
                    onEndOfLife: null
                }
            }
        },

        attackCombo: {
            cast: 6,
            onEnter(pl, ctx) {
                ctx.lookAtTarget(pl)
                playAnimCompatibility(pl, 'animation.highground.blocking.attack1.back')
            },
            timeline: {
                2: (pl, ctx) => ctx.trap(pl)
            },
            transitions: {
                blocking: {
                    onEndOfLife: null
                },
                attack2: {
                    onTrap: {
                        preInput: 'onAttack'
                    },
                },
                knockdown: {
                    onKnockdown: {
                        allowedState: 'both'
                    }
                },
            }
        },

        attack2: {
            cast: 6,
            backswing: 10,
            onEnter(pl, ctx) {
                ctx.freeze(pl)
                ctx.lookAtTarget(pl)
                playAnimCompatibility(pl, 'animation.highground.blocking.attack2')
                if (ctx.distanceToTarget(pl) > 2) {
                    ctx.setVelocity(pl, 60, 0.8, 0)   
                }
                setTimeout(() => {
                    if (ctx.distanceToTarget(pl) > 2) {
                        ctx.setVelocity(pl, 120, 0.8, 0)
                    }
                }, 350)
            },
            onAct(pl, ctx) {
                ctx.selectFromSector(pl, {
                    radius: 3.2,
                    angle: 120,
                    rotation: 45
                }).forEach(e => {
                    ctx.attack(pl, e, {
                        damage: 8,
                        knockback: 1.6,
                    })
                })
            },
            onLeave(pl, ctx) {
                ctx.unfreeze(pl)
            },
            transitions: {
                blocking: {
                    onEndOfLife: null
                },
                hit: {
                    onHurt: {
                        allowedState: 'both'
                    }
                },
                parried: {
                    onParried: {
                        allowedState: 'both'
                    }
                },
                knockdown: {
                    onKnockdown: {
                        allowedState: 'both'
                    }
                },
            }
        },

        changePosture: {
            cast: Infinity,
            onEnter(pl) {
                playAnimCompatibility(pl, 'animation.highground.blocking.hold', 'animation.highground.blocking.hold')
            },
            transitions: {
                blocking: {
                    onSneak: {
                        isSneaking: false
                    }
                },
                changePostureFlexible: {
                    onAttack: null
                },
                changePostureStrong: {
                    onUseItem: null
                },
            },

        },

        changePostureFlexible: {
            cast: Infinity,
            onEnter(pl) {
                playAnimCompatibility(pl, 'animation.highground.flexible.hold', 'animation.highground.flexible.hold')
            },
            transitions: {
                flexibleMode: {
                    onSneak: {
                        isSneaking: false
                    }
                },
                changePosture: {
                    onAttack: null
                },
                changePostureStrong: {
                    onUseItem: null
                }
            }
        },

        changePostureStrong: {
            cast: Infinity,
            onEnter(pl) {
                playAnimCompatibility(pl, 'animation.highground.strong.hold', 'animation.highground.strong.hold')
            },
            transitions: {
                strongMode: {
                    onSneak: {
                        isSneaking: false
                    }
                },
                changePostureFlexible: {
                    onAttack: null
                },
                changePosture: {
                    onUseItem: null
                }
            }
        },

        flexibleMode: {
            cast: Infinity,
            onEnter(pl, ctx) {
                playAnimCompatibility(pl, 'animation.highground.flexible.hold', 'animation.highground.flexible.hold')
            },
            transitions: {
                changePosture: {
                    onSneak: {
                        isSneaking: true
                    }
                },

                dodge: {
                    onUseItem: {
                        isOnGround: true,
                    }
                },

                sweap: {
                    onAttack: null
                },

                hit: {
                    onHurt: {
                        allowedState: 'both'
                    }
                },

                knockdown: {
                    onKnockdown: {
                        allowedState: 'both'
                    }
                },
            }
        },

        sweap: {
            cast: 10,
            backswing: 13,
            onEnter(pl, ctx) {
                ctx.lookAtTarget(pl)
                ctx.movement(pl, false)
                ctx.setVelocity(pl, 90, 1, 0)
                playAnimCompatibility(pl, 'animation.highground.sweap')
            },
            onAct(pl, ctx) {
                ctx.camera(pl, false)
                ctx.setVelocity(pl, 180, 1, 0.1)
                ctx.selectFromSector(pl, {
                    angle: 120,
                    rotation: -60,
                    radius: 3.5
                }).filter(e => e.uniqueId !== pl.uniqueId)
                .forEach(e => {
                    ctx.attack(pl, e, {
                        damage: 16,
                        knockback: 2
                    })
                })
            },
            onLeave(pl, ctx) {
                ctx.unfreeze(pl)
            },
            transitions: {
                dodge: {
                    onUseItem: {
                        isOnGround: true,
                    }
                },
                flexibleMode: {
                    onEndOfLife: null
                },
                parried: {
                    onParried: {
                        allowedState: 'both'
                    }
                },
                knockdown: {
                    onKnockdown: {
                        allowedState: 'both'
                    }
                },
            }
        },

        dodgeBlocking: {
            cast: 13,
            onEnter(pl, ctx) {
                ctx.freeze(pl)
                playAnimCompatibility(pl, 'animation.highground.dodge.start.blocking')
                ctx.applyKnockbackAtVelocityDirection(pl, 2.5, 0)
            },
            onLeave(pl, ctx) {
                ctx.unfreeze(pl)
            },
            timeline: {
                7: (pl, ctx) => ctx.trap(pl)
            },
            transitions: {
                dodgeToStrong: {
                    onTrap: {
                        preInput: 'onUseItem'
                    }
                },
                blocking: {
                    onEndOfLife: null
                },
                hit: {
                    onHurt: null
                },
                knockdown: {
                    onKnockdown: {
                        allowedState: 'both'
                    }
                },
            }
        },

        dodgeStrong: {
            cast: 13,
            onEnter(pl, ctx) {
                ctx.freeze(pl)
                playAnimCompatibility(pl, 'animation.highground.dodge.start.strong')
                ctx.applyKnockbackAtVelocityDirection(pl, 2.5, 0)
            },
            onLeave(pl, ctx) {
                ctx.unfreeze(pl)
            },
            timeline: {
                7: (pl, ctx) => ctx.trap(pl)
            },
            transitions: {
                dodgeToBlocking: {
                    onTrap: {
                        preInput: 'onUseItem'
                    }
                },
                strongMode: {
                    onEndOfLife: null
                },
                hit: {
                    onHurt: null
                },
                knockdown: {
                    onKnockdown: {
                        allowedState: 'both'
                    }
                },
            }
        },

        dodgeToBlocking: {
            cast: 6,
            onEnter(pl, ctx) {
                ctx.freeze(pl)
                playAnimCompatibility(pl, 'animation.highground.dodge.strong.to.blocking')
                ctx.applyKnockbackAtVelocityDirection(pl, 1, 0)
            },
            onLeave(pl, ctx) {
                ctx.unfreeze(pl)
            },
            transitions: {
                blocking: {
                    onEndOfLife: null
                }
            }
        },

        dodgeToStrong: {
            cast: 6,
            onEnter(pl, ctx) {
                ctx.freeze(pl)
                ctx.applyKnockbackAtVelocityDirection(pl, 1, 0)
                playAnimCompatibility(pl, 'animation.highground.dodge.blocking.to.strong')
            },
            onLeave(pl, ctx) {
                ctx.unfreeze(pl)
            },
            transitions: {
                strongMode: {
                    onEndOfLife: null
                }
            }
        },

        dodgeChange: {
            cast: 4,
            transitions: {
                dodgeTransToBlocking: {
                    onAttack: null
                },
                dodgeTransToStrong: {
                    onUseItem: null
                },
                dodgeTransToFlexible: {
                    onEndOfLife: null
                }
            }
        },

        dodgeTransToFlexible: {
            cast: 5,
            onEnter(pl, ctx) {
                playAnimCompatibility(pl, 'animation.highground.dodge.trans.flexible')
                ctx.applyKnockbackAtVelocityDirection(pl, 2, 0.12)
            },
            onLeave(pl, ctx) {
                ctx.unfreeze(pl)
            },
            transitions: {
                flexibleMode: {
                    onEndOfLife: null
                }
            }
        },

        dodgeTransToBlocking: {
            cast: 5,
            onEnter(pl, ctx) {
                playAnimCompatibility(pl, 'animation.highground.dodge.trans.blocking')
                ctx.applyKnockbackAtVelocityDirection(pl, 2, 0.12)
            },
            onLeave(pl, ctx) {
                ctx.unfreeze(pl)
            },
            transitions: {
                blocking: {
                    onEndOfLife: null
                }
            }
        },

        dodgeTransToStrong: {
            cast: 5,
            onEnter(pl, ctx) {
                playAnimCompatibility(pl, 'animation.highground.dodge.trans.strong')
                ctx.applyKnockbackAtVelocityDirection(pl, 2, 0.12)
            },
            onLeave(pl, ctx) {
                ctx.unfreeze(pl)
            },
            transitions: {
                strongMode: {
                    onEndOfLife: null
                }
            }
        },

        strongMode: {
            cast: Infinity,
            onEnter(pl) {
                playAnimCompatibility(pl, 'animation.highground.strong.hold', 'animation.highground.strong.hold')
            },
            transitions: {
                dodgeStrong: {
                    onSneak: null
                },
                kick: {
                    onUseItem: {
                        isOnGround: true
                    },
                },
                strongAttack: {
                    onAttack: null
                },
                hit: {
                    onHurt: {
                        allowedState: 'both'
                    }
                },
                knockdown: {
                    onKnockdown: {
                        allowedState: 'both'
                    }
                },
            }
        },

        strongAttack: {
            cast: 13,
            backswing: 17,
            onEnter(pl, ctx) {
                ctx.lookAtTarget(pl)
                ctx.movement(pl, false)
                playAnimCompatibility(pl, 'animation.highground.strong.attack')
                if (pl.isOnGround && ctx.distanceToTarget(pl) > 2) {
                    ctx.setVelocity(pl, 90, 1, 0.1)
                }
            },
            onAct(pl, ctx) {
                ctx.camera(pl, false)
                if (pl.isOnGround && ctx.distanceToTarget(pl) > 2) {
                    ctx.setVelocity(pl, 90, 1.5, 0.1)
                }
                const entities = ctx.selectFromSector(pl, {
                    angle: 10,
                    rotation: -5,
                    radius: 3.5
                })
                entities
                    .filter(en => en.uniqueId !== pl.uniqueId)
                    .forEach(en => {
                        ctx.attack(pl, en, {
                            damage: 35,
                            permeable: true,
                            knockback: 2
                        })
                    })
            },
            onLeave(pl, ctx) {
                ctx.unfreeze(pl)
            },
            transitions: {
                kick: {
                    onUseItem: {
                        isOnGround: true
                    }
                },
                strongMode: {
                    onEndOfLife: null
                },
                
                hit: {
                    onHurt: {
                        allowedState: 'both'
                    }
                },
                parried: {
                    onParried: {
                        allowedState: 'both'
                    }
                },
                knockdown: {
                    onKnockdown: {
                        allowedState: 'both'
                    }
                },
            }
        },

        kick: {
            cast: 16,
            backswing: 14,
            onEnter(pl, ctx) {
                ctx.lookAtTarget(pl)
                ctx.freeze(pl)
                playAnimCompatibility(pl, 'animation.highground.kick')
                ctx.task.queue(() => {
                    if (ctx.distanceToTarget(pl) > 1.5) {
                        ctx.setVelocity(pl, 90, 1.5, 0.1)   
                    }
                }, 150)
                .run()
            },
            onAct(pl, ctx) {
                if (ctx.distanceToTarget(pl) > 2) {
                    ctx.setVelocity(pl, 90, 0.5, 0.1)
                }
                ctx.selectFromSector(pl, {
                    angle: 30,
                    rotation: -15,
                    radius: 2.5,
                }).forEach(en => {
                    if (en.isPlayer()) {
                        ctx.knockdown(pl, en.toPlayer(), 2)
                    }
                })
            },
            onLeave(pl, ctx) {
                ctx.unfreeze(pl)
            },
            transitions: {
                kicked: {
                    onKnockdownOther: {
                        allowedState: 'both'
                    },
                },
                hit: {
                    onHurt: {
                        allowedState: 'both'
                    }
                },
                knockdown: {
                    onKnockdown: {
                        allowedState: 'both'
                    }
                },
                strongMode: {
                    onEndOfLife: null
                }
            }
        },
        kicked: {
            cast: 10,
            transitions: {
                strongMode: {
                    onEndOfLife: null
                }
            }
        },
        hit: {
            cast: 6,
            onEnter(pl, ctx) {
                playAnimCompatibility(pl, 'animation.general.hit')
                ctx.status.disableInputs([
                    'onAttack',
                    'onUseItem'
                ])
                ctx.freeze(pl)
            },
            onLeave(pl, ctx) {
                ctx.status.enableInputs([
                    'onAttack',
                    'onUseItem'
                ])
                ctx.unfreeze(pl)
            },
            transitions: {
                blocking: {
                    onEndOfLife: null
                },
                knockdown: {
                    onKnockdown: {
                        allowedState: 'both'
                    }
                },
            }
        },
        parried: {
            cast: 35,
            onEnter(pl, ctx) {
                playAnimCompatibility(pl, 'animation.general.parried.right')
                ctx.setVelocity(pl, -90, 1.5)
                ctx.freeze(pl)
            },
            onLeave(pl, ctx) {
                ctx.unfreeze(pl)
            },
            transitions: {
                default: {
                    onEndOfLife: null
                },
                hit: {
                    onHurt: { allowedState: 'both' }
                },
                knockdown: {
                    onKnockdown: {
                        allowedState: 'both'
                    }
                },
            }
        },
        knockdown: {
            cast: 30,
            onEnter: (pl, ctx) => {
                ctx.freeze(pl)
                ctx.status.disableInputs([
                    'onAttack',
                    'onUseItem'
                ])
                playAnimCompatibility(pl, 'animation.general.fell')
            },
            onLeave(pl, ctx) {
                ctx.unfreeze(pl)
                playAnimCompatibility(pl, 'animation.general.stand')
                ctx.status.enableInputs([
                    'onAttack',
                    'onUseItem'
                ])
            },
            transitions: {
                blocking: {
                    onEndOfLife: null
                }
            }
        },
        blocked: {
            cast: 6,
            transitions: {
                blocking: {
                    onEndOfLife: null
                }
            }
        }
    }
}