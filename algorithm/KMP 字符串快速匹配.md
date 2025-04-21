# KMP 字符串快速匹配

KMP算法（Knuth-Morris-Pratt）是一种用于在文本中查找子串的高效算法。它的核心思想是利用已经匹配过的部分信息来避免重复匹配，从而提高匹配效率。

## 算法原理

KMP算法的核心在于构建一个部分匹配表（Partial Match Table），也称为前缀函数（Prefix Function）。这个表用于记录模式串中每个位置的前缀和后缀的最长公共元素的长度。

### 部分匹配表的构建

假设模式串为`pattern`，长度为`m`。部分匹配表`pi`的构建过程如下：

1. 初始化：`pi[0] = 0`。
2. 迭代：对于`i`从1到`m-1`，进行以下操作：
   - 如果`pattern[i] == pattern[k]`，则`k = k + 1`，`pi[i] = k`。
   - 否则，如果`k > 0`，则`k = pi[k-1]`，继续比较`pattern[i]`和`pattern[k]`。
   - 否则，`pi[i] = 0`。

### 字符串匹配过程

在构建好部分匹配表后，可以进行字符串匹配。假设文本串为`text`，长度为`n`，模式串为`pattern`，长度为`m`。匹配过程如下：

1. 初始化：`i = 0`，`j = 0`。
2. 迭代：对于`i`从0到`n-1`，进行以下操作：
   - 如果`text[i] == pattern[j]`，则`i = i + 1`，`j = j + 1`。
   - 如果`j == m`，则匹配成功，返回匹配的起始位置`i - j`。
   - 否则，如果`j > 0`，则`j = pi[j-1]`，继续比较`text[i]`和`pattern[j]`。
   - 否则，`i = i + 1`。

## 代码实现

以下是KMP算法的Python实现：

```python
def compute_prefix_function(pattern):
    m = len(pattern)
    pi = [0] * m
    k = 0
    for i in range(1, m):
        while k > 0 and pattern[k] != pattern[i]:
            k = pi[k - 1]
        if pattern[k] == pattern[i]:
            k += 1
        pi[i] = k
    return pi

def kmp_search(text, pattern):
    n = len(text)
    m = len(pattern)
    pi = compute_prefix_function(pattern)
    j = 0
    for i in range(n):
        while j > 0 and text[i] != pattern[j]:
            j = pi[j - 1]
        if text[i] == pattern[j]:
            j += 1
        if j == m:
            return i - j + 1
    return -1
```

## 示例

以下是一个使用KMP算法进行字符串匹配的示例：

```python
text = "ababcabcacbab"
pattern = "abcac"
result = kmp_search(text, pattern)
print("Pattern found at index:", result)
```

在这个示例中，模式串`"abcac"`在文本串`"ababcabcacbab"`中的起始位置为6。

## 复杂度分析

KMP算法的时间复杂度为O(n + m)，其中`n`是文本串的长度，`m`是模式串的长度。空间复杂度为O(m)，因为需要存储部分匹配表。

## 总结

KMP算法通过构建部分匹配表，利用已经匹配过的部分信息来避免重复匹配，从而提高了字符串匹配的效率。它在实际应用中具有广泛的应用场景，如文本编辑器中的查找替换功能、DNA序列比对等。
