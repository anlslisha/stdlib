'use strict';

// MODULES //

var tape = require( 'tape' );
var path = require( 'path' );
var fs = require( 'fs' );
var readJSON = require( '@stdlib/fs/read-json' );
var noop = require( '@stdlib/utils/noop' );
var create = require( './../lib/async.js' );


// SETUP //

var spath = path.join( __dirname, './fixtures/_database.json' );
var opath = path.join( __dirname, './fixtures/database_async.json' );
fs.writeFileSync( opath, fs.readFileSync( spath ) );


// TESTS //

tape( 'main export is a function', function test( t ) {
	t.ok( true, __filename );
	t.equal( typeof create, 'function', 'main export is a function' );
	t.end();
});

tape( 'the function throws an error if the first argument is not an options object', function test( t ) {
	var values;
	var i;
	values = [
		5,
		'abc',
		NaN,
		null,
		void 0,
		true,
		[],
		function noop() {}
	];

	for ( i = 0; i < values.length; i++ ) {
		t.throws( badValue( values[i] ), TypeError, 'throws a type error when provided '+values[i] );
	}
	t.end();

	function badValue( value ) {
		return function badValue() {
			create( value, noop );
		};
	}
});

tape( 'the function throws an error if provided a callback argument which is not a function', function test( t ) {
	var values;
	var i;
	values = [
		5,
		'abc',
		NaN,
		null,
		void 0,
		true,
		{},
		[]
	];

	for ( i = 0; i < values.length; i++ ) {
		t.throws( badValue( values[i] ), TypeError, 'throws a type error when provided '+values[i] );
	}
	t.end();

	function badValue( value ) {
		return function badValue() {
			var opts = {
				'uri': 'http://stdlib.io/',
				'id': 'stdlib',
				'description': 'A standard library for JavaScript and Node.js.'
			};
			create( opts, value );
		};
	}
});

tape( 'if the function encounters an error when attempting to read a database, the function returns the error', function test( t ) {
	var opts = {
		'uri': 'http://stdlib.io/',
		'id': 'stdlib',
		'description': 'A standard library for JavaScript and Node.js.',
		'database': './nonexisting.json'
	};
	create( opts, done );

	function done( error ) {
		if ( error ) {
			t.ok( true, error.message );
		} else {
			t.ok( false, 'expected an error' );
		}
		t.end();
	}
});

tape( 'the function inserts a link to a link database', function test( t ) {
	var database;
	var opts;
	var uri;

	uri = 'http://stdlib.io/';
	database = './test/fixtures/database_async.json';
	opts = {
		'uri': uri,
		'id': 'stdlib',
		'description': 'A standard library for JavaScript and Node.js.',
		'database': database,
		'keywords': [
			'standard',
			'library',
			'lib'
		]
	};
	create( opts, done );

	function done( error ) {
		if ( error ) {
			t.ok( false, 'did not expected an error' );
		}
		readJSON( database, onJSON );
	}

	function onJSON( error, db ) {
		var expected;
		if ( error ) {
			throw error;
		}
		expected = {
			'id': 'stdlib',
			'description': 'A standard library for JavaScript and Node.js.',
			'short_url': '',
			'keywords': [
				'standard',
				'library',
				'lib'
			]
		};
		t.deepEqual( db[ uri ], expected, 'link has been successfully inserted' );
		t.end();
	}
});

tape( 'the created entry will have a period at the end of description even if forgotten', function test( t ) {
	var description;
	var database;
	var opts;
	var uri;

	uri = 'http://usejsdoc.org/';
	database = './test/fixtures/database_async.json';
	description = 'The official website of JSDoc';
	opts = {
		'uri': uri,
		'id': 'jsdoc',
		'description': description,
		'database': database
	};
	create( opts, done );

	function done( error ) {
		if ( error ) {
			t.ok( false, 'did not expected an error' );
		}
		readJSON( database, onJSON );
	}

	function onJSON( error, db ) {
		var expected;
		if ( error ) {
			throw error;
		}
		expected = {
			'id': 'jsdoc',
			'description': description+'.',
			'short_url': '',
			'keywords': []
		};
		t.deepEqual( db[ uri ], expected, 'description ends with a period' );
		t.end();
	}
});

tape( 'the function returns an error when the link database already contains an entry for the provided URI', function test( t ) {
	var database;
	var opts;
	var uri;

	uri = 'https://www.r-project.org/';
	database = './test/fixtures/database_async.json';
	opts = {
		'uri': uri,
		'id': 'r',
		'description': 'A free software environment for statistical computing and graphics.',
		'database': database
	};
	create( opts, done );

	function done( error ) {
		if ( error ) {
			t.ok( true, error.message );
		} else {
			t.ok( false, 'expected an error' );
		}
		t.end();
	}
});

tape( 'the function returns an error when the link database already contains an entry for the provided id', function test( t ) {
	var database;
	var opts;
	var uri;

	uri = 'https://en.wikipedia.org/wiki/R_Project';
	database = './test/fixtures/database_async.json';
	opts = {
		'uri': uri,
		'id': 'r',
		'description': 'Wikipedia entry for statistical programming language R.',
		'database': database
	};
	create( opts, done );

	function done( error ) {
		if ( error ) {
			t.ok( true, error.message );
		} else {
			t.ok( false, 'expected an error' );
		}
		t.end();
	}
});

