// This implementation only focus on element matching and quantifiers
/*
Elements: Literals		=> a, b
					Wild cards	=> .
					Escaped 		=> \.
					Groups  		=> (a+c)

Quantifiers:	Optional (one or zero) 	=>	?
							Zero or more						=>	*
							One or more							=>	+
*/

const parseRegex = (regex) => {
 	// The state will keep the state of matching // Stack up buy parser // Queue down by matcher
	// The parent array keep the state of the whole regex string
	// The child array consider as a group. Initially there is a one group.
	const state = [[]]
	let index = 0
	// Last method return last element of state
	const last = (array) => {
		return array ? array[array.length - 1] : state[state.length - 1]
	}

	while (index < regex.length) {
		const matcher = regex[index]

		if (matcher === '(') {
			// New group introduced. Need to add new child array to state array to keep group state
			state.push([])
			index++
			continue
		}

		if (matcher === ')') {
			// End of a group. Should close the group state and push to main state
			if (state.length === 1) {
				throw Exception('Unclosed group in index: ' + index)
			}

			const groupState = state.pop()
			last().push({
				type: 'ElementGroup',
				groupState,
				quantifier: 'OnlyOne'
			})

			index++
			continue
		}

		if (matcher === '.') {
			last().push({
				type: 'WildCard',
				quantifier: 'OnlyOne'
			})

			index++
			continue
		}

		if (matcher === '\\') {
			if (regex.length === index + 1) {
				throw Exception('Unsupported escape character at index: ' + index)
			}

			last().push({
				type: 'Element',
				value: regex[++index],
				quantifier: 'OnlyOne'
			})

			index++
			continue
		}

		if (matcher === '?') {
			// Zero or one quantifire
			last(last()).quantifier = 'ZeroOrOne'

			index++
			continue
		}

		if (matcher === '*') {
			// Zero or one quantifire
			last(last()).quantifier = 'ZeroOrMore'

			index++
			continue
		}

		if (matcher === '+') {
			// One or more = OnlyOne + ZeroOrMore
			last().push({...last(last()), quantifier: 'ZeroOrMore'})

			index++
			continue
		}

		// Default element state
		last().push({
			type: 'Element',
			value: regex[index],
			quantifier: 'OnlyOne'
		})
		index++
	}

	if (state.length !== 1) {
		throw Exception('Unclosed group detected')
	}

	return last()
};

const regex = 'ab?(a*b)+c.\\.d'
console.log(regex)
console.table(parseRegex(regex))