  /**
   * Gets all posts
   * @param {int} after how many posts to skip
   * @param {object} results how many posts to limit
   */
export const paginateResults = ({ cursor, results, count, limit}) => {

  const cursorIndex = results.findIndex( item => {
    // if there's still no a cursor, return false by default
    return cursor ? cursor == item.id : null
  });

 const end = cursorIndex + 1

  return  cursorIndex >= 0
    ? cursorIndex == count // don't let us overflow
      ? results
      : results.slice( 0, end)
    : results.slice(0, results.length);
}


