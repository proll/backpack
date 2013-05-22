2D Backpack packing problem solves
==============
We have many rectangle boxes. We can't rotate them as a condition. And finally we have to place each box to a most suitable free place in the backpack.
There are many algorithms. I only implement some. When we know every box and have to pack them all we can use offline algorithms. When we know only part of all boxes (like in Tetris game) we can use online algorithms.

[Demopage](http://46.17.40.10/backpack/)

Offline - Floor Сeiling No Rotation (FCNR)
--------------
**Algorithm FCNR**
```
Input: The number of rectangles to be packed n, 
      the dimensions of the rectangles 
      {w(Li); h(Li)} and the strip width W. 
Output: The height of a packing obtained in the strip.
 1: Sort the rectangles in order of non-increasing height such that h(L1) ≥ h(L2) ≥ ... ≥ h(Ln)
 2: for i = 1..n do
 3:   if Li is ceiling feasible then
 4:     pack Li on ceiling with minimum residual space
 5:   else [Li is not ceiling feasible]
 6:     if Li is floor feasible then
 7:       pack Li on the floor with minimum residual space
 8:     else [Li is not floor feasible]
 9:       level++;
10:     end if
11:   end if
12: end for
13: Output the height H of the strip, found by adding the height of each level
```


Offline - Burke
--------------
**Algorithm Burke**
```
Input: The number of rectangles to be packed n,
       the dimensions of the rectangles
       {w(Li); h(Li)} and the strip width W.
Output: The height of a packing obtained in the strip.
 1: Sort the rectangles according to non-increasing width such that w(Li) ≥ w(Li+1) ≥ .. ≥ W(Ln)
 2: for each placement policy
    (leftmost, tallest neighbour, smallest neighbour) do
 3:   while Rectangles not packed do
 4:     find lowest gap
 5:     if w(Li) ≤ GapWidth then
 6:       place best fitting rectangle using placement policy
 7:       raise elements of array to appropriate height
 8:     else
 9:       raise gap to height of the lowest neighbour
10:     end if
11:   end while
12: end for
13: The elements of the array with greatest entry give the total height of the packing
14: Compare total packing heights obtained by each placement policy and return the best solution
```



Online - Online Fit (OF)
--------------
**Algorithm OF**
```
Input: The dimensions of the rectangles {w(Li); h(Li)} and the strip width W.
Output: The height H and the entire packing.
 1: i = 0; H = 0
 2: Create a linear array whose number of elements are equal to W
 3: while there is an unpacked rectangle do
 4:    i++
 5:    Search the list of empty areas for sufficient space to pack Li
 6:    if w(EmptyArea) ≥ w(Li) and h(EmptyArea) ≥ h(Li) then
 7:       pack rectangle in empty area
 8:    else
 9:       if rectangle does not fit in any of the empty areas then
10:          search the linear array for available packing width
11:       else [there is insufficient space in linear array]
12:          pack rectangle on top left justified
             from the index leading to smaller space
13:       end if
14:    end if
15: end while
16: H = highest entry in the linear array
17: print H and entire packing
```



Online - Best Fit Level (BFL)
--------------
**Algorithm BFL**
```
Input: The dimensions of the rectangles {w(Li); h(Li)} and the strip width W.
Output: The height H and the entire packing.
 1: level = 0; h(level + 1) = h(L1); H = h(L1); i = 0
 2: while there is an unpacked rectangle do
 3:    i++; level = 0
 4:    search for lowest level with minimum residual horizontal space
 5:    if such a level exists then
 6:       pack rectangle left justified
 7:    else [such a level does not exist]
 8:       create a new level above the top-most level
 9:       pack rectangle left justified
10:       h(level) = h(Li); H += h(Li)
11:    end if
12: end while
13: print H and entire packing
```
