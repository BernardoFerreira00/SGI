export class Helpers  {


    /**
     * Accepts a character and returns the coordinates for 
     * that char in the texture.
     */
    static getCharCoordinates(character) {
        switch (character) {
            case '0':
                return [0, 3]
            case '1':
                return [1, 3]
            case '2':
                return [2, 3]
            case '3':
                return [3, 3]
            case '4':
                return [4, 3]
            case '5':
                return [5, 3]
            case '6':
                return [6, 3]
            case '7':
                return [7, 3]
            case '8':
                return [8, 3]
            case '9':
                return [9, 3]
            case 'A':
                return [1, 4]
            case 'B':
                return [2, 4]
            case 'C':
                return [3, 4]
            case 'D':
                return [4, 4]
            case 'E':
                return [5, 4]
            case 'F':
                return [6, 4]
            case 'G':
                return [7, 4]
            case 'H':
                return [8, 4]
            case 'I':
                return [9, 4]
            case 'J':
                return [10, 4]
            case 'K':
                return [11, 4]
            case 'L':
                return [12, 4]
            case 'M':
                return [13, 4]
            case 'N':
                return [14, 4]
            case 'O':
                return [15, 4]
            case 'P':
                return [0, 5]
            case 'Q':
                return [1, 5]
            case 'R':
                return [2, 5]
            case 'S':
                return [3, 5]
            case 'T':
                return [4, 5]
            case 'U':
                return [5, 5]
            case 'V':
                return [6, 5]
            case 'W':
                return [7, 5]
            case 'X':
                return [8, 5]
            case 'Y':
                return [9, 5]
            case 'Z':
                return [9, 5]
            case '/':
                return [15, 2]
            case ':':
                return [10, 3]
            case ' ':
                return [0, 2]
        }
    }

    /**
     * Computes distance between two points.
     */
    static calculateDistance(position1, position2) {

        var xx = Math.pow(position2[0] - position1[0], 2);
        var yy = Math.pow(position2[1] - position1[1], 2);
        var zz = Math.pow(position2[2] - position1[2], 2);

        return Math.sqrt(xx + yy + zz);
    }

    static parsePoint(point) {

        point[0] = parseInt(point[0]);
        point[2] = parseInt(point[1]);
        point[1] = 0.5

        return point;
    }

    static calculateScalarProduct(vector1, vector2) {

        return vector1[0] * vector2[0] + vector1[1] * vector2[1] + vector1[2] * vector2[2];
    }

    static obasulteValueVector(vector) {

        return Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2) + Math.pow(vector[2], 2));
    }

    static calculateAngleBetweenVectors(vector1, vector2) {
        
        return Math.acos(Helpers.calculateScalarProduct(vector1, vector2)/(Helpers.obasulteValueVector(vector1) * Helpers.obasulteValueVector(vector2)));
    }

    static vectorNormalization(vector) {
        
        var absuloteValue = this.obasulteValueVector(vector);

        return [vector[0]/absuloteValue, vector[1]/absuloteValue, vector[2]/absuloteValue];
    }

}





