---
title: Affine transformations for dumb assholes
description: trying to make sense of it
date: 2025-03-29
tags: GIS
---

## Intro


Affine transformations are a fundamental concept in geometry and computer graphics, particularly in 2D and 3D graphics.
An affine transformation is a linear transformation followed by a translation. In 2D, it can be represented by a 2x2 matrix for the linear transformation part and a 2x1 vector for the translation part.

In 2D, an affine transformation can include the following operations:

1. **Translation**: Moving an object in a certain direction by a certain distance.
2. **Scaling**: Enlarging or shrinking an object by a certain factor along the x and y axes.
3. **Rotation**: Rotating an object by a certain angle around a fixed point (usually the origin).
4. **Shearing**: Distorting an object by stretching or compressing along one axis while keeping the other axis fixed.

Mathematically, an affine transformation $ T $ can be represented as:

$$ T(\mathbf{p}) = A \mathbf{p} + \mathbf{t} $$

Where:
- $ \mathbf{p} $ is a point in the original coordinate system.
- $ A $ is a 2x2 matrix representing the linear transformation.
- $ \mathbf{t} $ is a translation vector.
- $ T(\mathbf{p}) $ is the transformed point.

The linear transformation matrix \( A \) typically represents a combination of scaling, rotation, and shearing. It is usually represented as:

$ A = \begin{bmatrix} a & b \\ c & d \end{bmatrix} $

And the translation vector $ \mathbf{t} $ is represented as:

$\mathbf{t} = \begin{bmatrix} t_x \\ t_y \end{bmatrix} $

The transformed point \( T(\mathbf{p}) \) can be computed as:

$ T(\mathbf{p}) = \begin{bmatrix} a & b \\ c & d \end{bmatrix} \begin{bmatrix} x \\ y \end{bmatrix} + \begin{bmatrix} t_x \\ t_y \end{bmatrix} $

$ T(\mathbf{p}) = \begin{bmatrix} ax + by + t_x \\ cx + dy + t_y \end{bmatrix} $

## Affine transformation matrix
We often combine the linear transformation matrix $ A $ and the translation vector $ \mathbf{t} $ into a single matrix called the affine transformation matrix. This combined matrix allows us to represent both the linear transformation and translation as a single matrix operation.

The affine transformation matrix \( M \) is typically represented as a 3x3 matrix in 2D:

$ M = \begin{bmatrix} a & b & t_x \\ c & d & t_y \\ 0 & 0 & 1 \end{bmatrix} $

Where:
- $ a, b, c, $ and $ d $ represent the linear transformation part (scaling, rotation, and shearing).
- $ t_x $ and $ t_y $ represent the translation part.
- The last row $ [0, 0, 1] $ is a homogeneous coordinate that allows us to represent translations as matrix multiplication.

The affine transformation matrix allows us to perform the transformation of a point $ \mathbf{p} $ in homogeneous coordinates as follows:

$ \begin{bmatrix} x' \\ y' \\ 1 \end{bmatrix} = \begin{bmatrix} a & b & t_x \\ c & d & t_y \\ 0 & 0 & 1 \end{bmatrix} \begin{bmatrix} x \\ y \\ 1 \end{bmatrix} $

This simplifies to:

- $ x' = ax + by + t_x $
- $ y' = cx + dy + t_y $

Where $ (x', y') $ are the coordinates of the transformed point.

By combining the linear transformation and translation into a single matrix, we can efficiently apply the entire affine transformation to multiple points or objects using matrix multiplication. This approach is widely used in computer graphics, image processing, and geometric modeling.

## Rasterio
In the context of rasterio, the transformation matrix is often represented as a 3x2 matrix rather than a 3x3 matrix. This representation is specific to the needs of raster processing and geospatial analysis.

1. **Affine Transformations in Rasterio**: Rasterio is a Python library for reading and writing geospatial raster datasets. It uses affine transformations to represent the mapping between pixel coordinates and geographic coordinates.

2. **Coordinate Transformation**: In geospatial analysis, the transformation matrix is used to map pixel coordinates (row, column) to geographic coordinates (e.g., latitude, longitude). This transformation typically involves scaling, rotation, and translation, **but not shearing**, as shearing is not applicable in the context of geospatial coordinates.

3. **Reduced Dimensionality**: Since shearing is not used in geospatial transformations, the transformation matrix can be simplified to a 3x2 matrix. The last row of a 3x3 transformation matrix in general affine transformations (0 0 1) is not needed in this context because the transformation from pixel coordinates to geographic coordinates does not involve a homogeneous coordinate.

4. **Efficiency**: Representing the transformation matrix as a 3x2 matrix rather than a 3x3 matrix saves memory and computational resources, as it eliminates the need to handle an additional row of values that are not used in geospatial transformations.

In summary, the use of a 3x2 transformation matrix in rasterio is a practical choice tailored to the specific requirements of geospatial analysis, where shearing is not typically applied, and efficiency is important. This representation efficiently handles the mapping between pixel coordinates and geographic coordinates in raster datasets.

To use a 3x2 transformation matrix to transform coordinates from one coordinate space to another, typically from pixel coordinates to geographic coordinates (or vice versa), you would multiply the transformation matrix by a vector representing the original coordinates.

Let's denote the transformation matrix as $ M $:

$ M = \begin{bmatrix} a & b \\ c & d \\ t_x & t_y \end{bmatrix} $

Where:
- $ a, b, c, $ and $ d $ represent the linear transformation part.
- $ t_x $ and $ t_y $ represent the translation part.

To transform a point represented by the original coordinates \( (x, y) \) to the new coordinates \( (x', y') \), you would compute:

$ \begin{bmatrix} x' \\ y' \end{bmatrix} = \begin{bmatrix} a & b \\ c & d \\ t_x & t_y \end{bmatrix} \begin{bmatrix} x \\ y \end{bmatrix} $

This can be expressed as:

- $ x' = a \cdot x + b \cdot y + t_x $
- $ y' = c \cdot x + d \cdot y + t_y $

Where $ (x', y') $ are the transformed coordinates.
