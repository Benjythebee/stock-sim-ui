import classnames from 'classnames';

export function cn(...inputs: classnames.ArgumentArray) {
    return classnames(inputs);
}