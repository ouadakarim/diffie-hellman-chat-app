/**
 * Created by Karim Ouada on 23.12.2017.
 */
process.env.NODE_ENV = 'test';
const chai = require('chai');
const should = chai.should();
import {findPrimes} from '../utils';

describe('Check primes for various numbers', () => {
    describe('Primes from 2 to 15', () => {
        it('should return an array with correct and sorted primes', (done: any) => {
            let primes = findPrimes(2, 15);
            primes.should.be.eql([2, 3, 5, 7, 11, 13]);
            done();
        });
    });
    describe('Primes from 2 to 100', () => {
        it('should return an array with correct and sorted primes', (done: any) => {
            let primes = findPrimes(2, 100);
            primes.should.be.eql([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41,
                                    43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]);
            done();
        });
    });
});