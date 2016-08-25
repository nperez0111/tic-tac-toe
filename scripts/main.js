var tickyTacky = Ractive.extend( {
    oncomplete: function () {
        this.on( "select", function ( a, b ) {
            if ( this.get( "hasWon" ) ) {
                return;
            }
            var row = Number( b.split( ":" )[ 0 ] ),
                col = Number( b.split( ":" )[ 1 ] );
            if ( this.get( "board" )[ row * this.get( "size" ) + col ] !== null ) {
                return;
            }
            var b = this.get( "board" );
            b[ row * this.get( "size" ) + col ] = this.get( "turn" ) % 2 === 0;
            this.set( "board", b );
            if ( this.get( "hasWon" ) ) {
                return;
            }
            this.set( "turn", this.get( "turn" ) + 1 );
            if ( this.boardIsEmpty( this.get( "board" ) ) ) {
                this.fire( "clear" );
            }
        } );
        this.on( "clear", function () {
            var size = this.get( "size" );
            this.set( {
                turn: 0,
                board: ( new Array( size * size ) ).fill( null )
            } )
        } );
    },
    data: () => {
        var size = 3;
        return {
            r: ( new Array( size ) ).fill( true ),
            c: ( new Array( size ) ).fill( true ),
            board: ( new Array( size * size ) ).fill( null ),
            turn: 0,
            size: size,
            isFilled: function ( row, col ) {
                return this.get( "board" )[ row * this.get( "size" ) + col ] !== null;
            },
            display: function ( row, col ) {
                return this.get( "board" )[ row * this.get( "size" ) + col ] ? 'X' : 'O';
            },
            isWinLoc: function ( row, col ) {
                return this.get( "winLocs" ) && this.get( "winLocs" ).indexOf( row * this.get( "size" ) + col ) > -1 ? "winLoc" : "";
            }
        }
    },
    computed: {
        curTurn: {
            get: function () {
                return this.get( "turn" ) % 2 == 0 ? 'X' : 'O'
            }
        },
        hasWon: {
            get: function () {
                return this.isWin( this.get( "board" ), 0 );
            }
        },
        hasWonVia: {
            get: function () {
                return this.isWin( this.get( "board" ), 1 );
            }
        },
        winLocs: {
            get: function () {
                return this.isWin( this.get( "board" ), 2 );
            }
        }
    },
    hasPattern: function ( board, generateLocs ) {
        var shouldMatch = function () {
                var args = Array.from( arguments );
                if ( args.length == 1 ) {
                    return function ( b ) {
                        return args[ 0 ] === b;
                    }
                }
                return args[ 0 ] === args[ 1 ];
            },
            locs = generateLocs( this.get( "size" ) ),
            toBoard = function ( cur ) {
                return board[ cur ];
            },
            checkAllAreEqual = function ( locs, i, allLocs ) {
                var firstToCheck = board[ locs.slice( 0 )[ 0 ] ];
                return locs.map( toBoard ).every( shouldMatch( firstToCheck === null ? undefined : firstToCheck ) )
            },
            patternMatched = locs.filter( checkAllAreEqual );
        if ( patternMatched.length > 0 ) {
            return patternMatched;
        }
        return false;
    },
    isWin: function ( board, howToRespond, ways ) {
        ways = ways || this.waysToWin;
        howToRespond = howToRespond === undefined ? 0 : howToRespond;
        var keys = Object.keys( ways ),
            vals = keys.map( function ( a ) {
                return ways[ a ];
            } ),
            ifNotEmpty = function ( x ) {
                if ( !Array.isArray( x ) || x.length === 0 ) {
                    return false;
                }
                return x[ 0 ];
            },
            that = this;
        switch ( howToRespond ) {
            case 0: //returns bool
                return vals.some( function ( cur ) {
                    return that.hasPattern( board, cur );
                } );
                break;
            case 1: //returns type of win String
                var hasPattern = keys.filter( function ( cur, index ) {
                    return that.hasPattern( board, vals[ index ] );
                } );
                return ifNotEmpty( hasPattern );
                break;
            case 2: //returns win placement itself Array
                var patternsMatched = vals.map( function ( cur, index ) {
                    return that.hasPattern( board, cur );
                } ).filter( function ( a ) {
                    return a;
                } );
                return ifNotEmpty( ifNotEmpty( patternsMatched ) );
                break;
        }
    },
    waysToWin: {
        horizontally: function ( size ) {
            return ( new Array( size ) ).fill( true ).map( function ( curr, row ) {
                return ( new Array( size ) ).fill( true ).map( function ( cur, col ) {
                    return size * row + col;
                } );
            } );
        },
        vertically: function ( size ) {
            return ( new Array( size ) ).fill( true ).map( function ( curr, row ) {
                return ( new Array( size ) ).fill( true ).map( function ( cur, col ) {
                    return size * col + row;
                } );
            } );
        },
        diaganolly: function ( size ) {
            var col = 0,
                otherCol = 0;
            return [ ( new Array( size ) ).fill( true ).map( function ( c, row ) {
                return ( row * size ) + ( col++ );
            } ), ( ( new Array( size ) ).fill( true ).map( function ( c, row ) {
                return ( ( row + 1 ) * size ) - ( ++otherCol );
            } ) ) ];
        }
    },
    boardIsEmpty: function ( board ) {
        return !board.some( function ( cur ) {
            return cur === null;
        } );
    },
    trackcurrent: function ( board ) {
        var bro = "|",
            brt = "|",
            br = "|";
        for ( var i = 0, l = board.length; i < l; i++ ) {
            if ( i / 3 < 1 ) {
                bro += board[ i ] ? ' X ' : board[ i ] === null ? ' ' + i + ' ' : ' O ';
            } else if ( i / 3 < 2 ) {
                brt += board[ i ] ? ' X ' : board[ i ] === null ? ' ' + i + ' ' : ' O ';
            } else {
                br += board[ i ] ? ' X ' : board[ i ] === null ? ' ' + i + ' ' : ' O ';
            }
        }
        bro += "|";
        brt += "|";
        br += "|";
        var whosturn = "Turn Number:" + this.get( "turn" );
        this.logger( whosturn.split( "" ).fill( '‾' ).join( "" ) );
        this.logger( bro );
        this.logger( brt );
        this.logger( br );
        this.logger( whosturn );
        this.logger( whosturn.split( "" ).fill( '‾' ).join( "" ) );
    },
    log: true,
    logger: function ( a ) {
        this.log && console.log( a );
        return a;
    }
} )

$( document ).ready( () => {
    tick = new tickyTacky( {
        el: '.hook',
        template: '#template'
    } )
} )
