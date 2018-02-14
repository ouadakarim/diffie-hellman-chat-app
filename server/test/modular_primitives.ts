/**
 * Created by Karim Ouada on 23.12.2017.
 */
process.env.NODE_ENV = 'test';
const chai = require('chai');
const should = chai.should();
import {findPrimitives} from '../utils';

describe('Check primitives for various numbers', () => {
    describe('Primitives of 11', () => {
        it('should return an array with correct and sorted primitives', (done: any) => {
            let primitives = findPrimitives(11);
            primitives.should.be.eql([2, 6, 7, 8]);
            done();
        });
    });
    describe('Primitives of 17', () => {
        it('should return an array with correct and sorted primitives', (done: any) => {
            let primitives = findPrimitives(17);
            primitives.should.be.eql([3, 5, 6, 7, 10, 11, 12, 14]);
            done();
        });
    });
    describe('Primitives of 71', () => {
        it('should return an array with correct and sorted primitives', (done: any) => {
            let primitives = findPrimitives(71);
            primitives.should.be.eql([7, 11, 13, 21, 22, 28, 31, 33, 35, 42, 44, 47, 52, 53, 55, 56, 59,
            61, 62, 63, 65, 67, 68, 69]);
            done();
        });
    });
});