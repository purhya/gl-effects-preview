# 自然饱和度 (Vibrance)


### 预览

<color-correction-preview .name="vibrance"></color-correction-preview>


### 算法简介

在网上未能找到这个算法, 不过我在观察友商的自然饱和度调色时, 发现它在调整幅度很大的时候也没有发生偏白或者偏黑的情况, 所以我猜测 RGB 均值不变, 于是给出了类似的算法:

算法改进自对比度算法, 不过做 RGB 偏移时是根据 RGB 的均值. 请参考对比度的算法.

