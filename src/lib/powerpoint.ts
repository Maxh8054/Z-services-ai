import pptxgen from 'pptxgenjs';
import { saveAs } from 'file-saver';
import type { InspectionData, PhotoData, AdditionalPart, PhotoCategory } from '@/types/report';
import { t, type Language } from './translations';

// Logo placeholder (base64) - Replace with actual logo
const LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANgAAAB6CAYAAADd9J0IAAAQAElEQVR4AeydCXxV1bX/9w1DAoEwhiEIZABEhkAYIooPRavWFutQtda/bUFrtXb4Y2srDk9xbp99ta1tn/5r1X6kxda2+keltlYcakEEGUKYpwBhkCkhEMBAct/3d5JzucM5596bgUBy+GTdc/bea6+999pr7bX22uccUoz/z+eAz4Em44CvYE3GWp+wzwFjfAXzpcDnQBNywFewJmSuT9rngK9gvgw0FwdaRbu+grWKafYH2Vwc8BWsuTjvt9sqOOArWKuYZn+QzcUBX8Gai/N+u62CA76CnZLT7HeqpXDAV7CWMpP+OE5JDvgKdkpOi9+plsIBX8Faykz64zglOeArWD2mJXh3p8zgI90nBH/U+4rgj/pcFnysz7DgT8/oUA9SfpUWzoHTT8GacUKCD3UtCP7kjLeDmf13mzYdF5jq4Kum2swNpqSuNCld9gSfGHjv+l8MSm3GLvpNn2Ic8BUswQkJPtb1aya99xJTvvvCwJ7VxhwoNaZiN9ddJrB/izE7V6abIxWPDGqTsaD88QHdEiTro7VwDvgKlsAEBx/scrFp3+sFs2etMdVVxqS0N6ZNO2PadTDBrlnGDLrAmMEXHTMd0Kv92wq6ZGS+HZw5DKQEiPsoLZoDKS16dI0wuOBd3bqYzKFzLIuV0hbFQm8CAWNqqo1pl2oCWaMOVe3fmr93X2kP0z7tQZPWxZiy0gLTueruRmjeJ3GacyDlNO9/03c/I3CTKS9NMzXHjJFiGZTL8C9YY0zbVGOOls1NnbFpReZdaw9Wfnr46WCnXuSVG9M1d2b5DN9VhFMt568eI0mpR53WVaVjj+vNURRGo7YUTDdAANZVo3TtOo4OzszqGQwGA+nGnB+oOmhMEOvGHq1Dpxp8R3D9v1bLAaSk1Y497sCDM017k9Ixx2jfZWHXWS/dp7Qx5thRY8q3DzHZ+RvMcxesMhn9XzLlBD+CIFRVmrYdOo7nzv9rxRzwFcxr8vcNCphAAE1yQJIFCx43pmyzMZs/6GK2LhlqSj8y5lMsmAlYFWqCbTpaN/5Pq+WAr2BeU/+L9cfM8aOlpk07F6xaRTLHPzXm+BFcQ0yXsgTt0s2xquOYM5eqfnar4ICvYB7THAgEao4f2P2qaZ8BFsoTBLiL/EObAgJYqatwCIAEM/qayqqqeZG4LTflj8yZA0iFc4GfW8uBiuPm2WC3bGNSsGIKXtRmR/0GSAtqsGLctu9kqo8efL/nAyVLSfl/rZgDvoLFmfwej+7fdnj7ijtNeibKgwWrYd/lWIeyasrack7Wb7w5sm/7LYFAgExHZD+zlXDAV7AEJjr90UNPHj188BnT5QxjHTAfY8+lEL0Om6VwSldVGcO+ywycaMpLlp+fMXP7ugRI+ygtnAMpLXx8jTI8LFFN2oP7b9/3yfapNX3yd5vuuIztOfUK4BbKYnXubcwZY8ynnfu/v39j8fBuj+55v1Ea9omc9hzwFSzBKQwEAjU9n6z+3cItRdlFG7ZdsfVA9e/2BbvO31Pd5Z2SvUcfL169eVTqnasu6PH4rlVRJP1kK+aAr2BJTv65T5ojo35TPWfgzw5P7fnYnom9Ht11Yc7PDtwz8n/KilBCf8+VJD9bOrqvYC19hv3xNSsHfAVLgP16zhC0nkABcBVwO/AD4AHgIeAe4EvAMMB/egMm+H+1HPAVrJYPMb9/+tOf9IhUHgV35+TkrB8wYMCelJSUJaT/CvwK+C9gJvCfwKPAS126dFk5bty4ytzc3HkdOnT4UufOnXuQ7/+1Yg40s4KdWpyXpUpNTR3cvm3bR773ve9ty8jI2MC+6rGSkpK8rVu3mpoaDpI9unzgwAGzePFis2nTpsmgvdS/f/+9vXtl/jU9PX00af+vFXLAVzAmXYqFuboMK1WclZW1rl1q6r2lpaV9KyoqDGVgeP+hhEYQjnXkyBGzatUqU3Hw0FXQXNqzZ49XfYsWzqHWcd/qFax9+/b5ffv2XdY7K2vu9u3bh23evNlUVlaGZl+Kk5LizaZu3bqZ888/30yZMqXy3HPPNT16nPAMpWjr1683R44cvWLw4ME709Pb54eI+zctngPektOChz9z5swUXMF7ceOW79q1K3/Hjh2WCyiFGjhwoLnwwgtNfv7IlVIcXEVPTmCZDC7kLFzD7luLi3scPXr0stzs7L9J2bp3727VldIuWbKkXU7OkOXszyZYmf5Pi+dAq1Qw9kS9f/3rX3+U2qHDIxs3brQmWYo1aNAgM3rUqHVlZXtvKCoqyrj66i/mr1698uV4Fkx1Dx8+XIRLWFVaUbEfZXpzU0nJ51auXJmbkdHp5ZEjR5p27dpZ7RQXF5uhQ4cu6Nq1a7bx/zUjB05O061OwTp27DhmyJAhu/bs2TP24EG9HGlMp06dzKRJk4LkXbNk6dKhFRWVs/fu3XsQ65WSkdF1YllZWdzZCFYfq9WgMEyCHptLSrZeV7ply+cLCwtDSrZmzRqTmZn5Rl2kMqyGf9vSONCqFAzlGo9yfbxs2TIreCHLk5eXZ/r06fMqFqsbCvEX8kJPY0yePPkc9lBZiQQ62rRpk+omHGUVFXNXLl9+wdixY42sITS1zxt209Spt7nV8fNbBgdajYKxT8IzG/rRihUrLOUiuGG0Ryov3zdtw4YNV2GlDkRPKfun+z755JPobMd0Stu2aY4FdZnlhw69h3t4e3Z2tpUjumefc84vaSPDyvB/WiQHWoWCSYhzc3MXy3JVV1cbKRfun8FVK9y3r/wFp5lNS0vLJmx/ybFjx5yKY/LaBFy+3RGGiUv6dKf09GIsqVE/pOw1Nce/Fobi37YwDrQKBcN9m7V27dp0HRRzkGwmTpxoipcuHb9v375F7vNZcytnYe7F0SXy/aLzotJyPzdsXHc3xwJWCXs+M3zYiG/hggasjFPlx+9Ho3GgxStYhw7tr8FiXE7o3CDghN7zDfuhS3bu3bvYg4upBQVjv4Pb6IFSv6LU1I7/6tevn9UXFMt07dbtzMGDe3SuHzW/1qnOgRatYFlZWR3PPvvcF7dt22bNA8EMs2vXjid379//lpXh8tPGmEt3796dLjfOBSU2W+YxNjcmZ//+/QcPHTq0wQ7b4zaaw4fTusYg+hktggMtWsHKyvbdsnr16jTJPnsqM3jw4APBYODeeDM3ICdnJofP8dCiyhNjJVa0Bmu6p23btlZ97fG4r01YOf5PS+JAYlJxGo4Y9ytl6NCzfqh9jrqvfc/SpUtvZF91RGk3QBFzO3ToUMBhsRuKc36KSZiXKFnH48ePW3RkybhPLJJi1fB/TicOJCwUp9Og1NcuaWm5waDJkvWSEOfk5Bzp37//P1TmBQj71J07d7qiNEJBew6282S5REuPYWHBDuneh5bHgRarYMdSggVECa0ZI0xvNm7c+Gc9ymRluP+kchh8h/ZF7igNK+nUqX1eeXl5JyysFeiA2u6f/OQnFVz9vxbIgRarYCkpbXKOHKn1Brt27WoqysreTGD+zuYAuBNWLAHU+qGkpna+yw669OrVyxQVFf32uuuuq64fNb/Wqc6BFqtggUCbUBRQLmKwpiau35eZmTnd3rM1xcSlp6ePJkT/tcOHDxvcQjN8+HATPHz4l03Rlk/z1OBAi1UwQuxlEmKxWfudmpRgX927AfuizOzs7Ktsq+eG55ZfXa3/asWt1MpPI4r5ht4NUwplltv6m2179+5Q2oeWyYHGVLBTikMEN9ZxwGz1SXuxbt16Xm4lXH6wKtfqZUvquWB4Z6PQrpFA9luB3r17z8Y1zJICS/Hz8/MNin+PN1W/9HTnQItVsJSUlBU9e+pDUMZIwfLy8q4n7fjEhF4bGT169IwDB2Ke9014flGWT52Q33nnnbYo15/pz5Xqh3Byc3PNwvnzp+3YsWOv0j60XA60WAXDIpUSrFinZw+xIKa4uNhUVVXd6TSVBBkmHjp0qD9K4lScWF5NTe3LZWHYnKf1u+mmmxbTj6vt0L8CG/RtdvnBg44PGYdV929bAAdarIJxmBskNH83Z1/WNCl4QYDh/s6dO0+0MsJ+sGw/4AA6LCf526NVVbUhyxNVbx40aFDprl27Ru3fv9/K7dKli+nTp88S2ppqZfg/LZ4DLVbBNHOcZ72C1dI0Cq13wNatW2dGjhz5AdG8USoX1AU3pmBVlKw3QHPYzJkzU7CYeSjs33r06PGsXkfRnktEdRY3cODAYo4BJpGuAvy/xuPAKUupRSuYrNjevXtvHDdunEHwrXewFi1aZEaMGLGMAMgVGRkZ3Qk4PIBFadAE4V6K5nfefvvt3QMGDNjAXuuzQIjmGWecoc8SvI4lK0TBTnyyKoTh37RUDrRoBdOkYZl2Ll68+E4sipKK3JmFCxcarMyrnEPtIwDxLa/XUghOWGdWKKtV3+lH30/897//bebPn99DYXjt+YSnFzsVLUTZpm/ZsuULKHK0Gyk0H1owB5pMwXCJztB+Jy0tbTJWYhIwkQPfCcA4oAAYDV9Hcx2FII7k/izgzDoYRl4+ZWOwNONxv0ajCOmU1euPIMN+2o+oSwTPLF261GzYsMF8+qljANBoz1RQUGC9oIl7F/poTQQhErKOjNUwVlIn/tjzmdWrV38dN/HnKGjoWx8nMPRydfsRjHMc4z2L+rnQytMVyAZylK6DIeDkcz+IBaNdGI2Ebrvyj6BLIfxUW8OhdRa0zgQGA4OAwcoDhuI2D2PsY7t16zYiOzs7LboBaPSF1gTNC/gjuOZDfhQ8GFKfvkXTb0npJlEwJub/9O3bdxtK8QFCNo9Jeg/4ACFdACwClgBLCQIs5boMt6qI+1XAmjpYSd5yyj6GzkfQWUqwYh1Km/T3K9q0aXM9VuQ5BTnsiRsyZIg555xzDH0zCL6dHXFFcIy+2bFly5bJRUVFAzkYXokgReDYCfplLrrooiAWca1C8DZNWTZ48VkbL/xaF77/F+NcASwCVuFKbmScG3QFNgOblK6DtVzFk/XXXnvtYniS8IKDwgxnoShjvAuhuYg+FnNssQpYA6yD5+vrrspbDc5Kop2L4f0KYDHpDnbfUaxzCwsLd9CXBfRZc7iCeVpOf5aBt3bq1KnzfCWzuWUSf8XiRJX4dzD8GytXrrSsA5E86ypLUR9Q/U2bNpny8vIsDnOHxG+9FgOhz+jTp88cYPbHH39ssCJWgfZj0Lwcd+5GVlxXBUMxZH1+xh7uXVzIrfz7J5bGohH9I2VEYe7H9TyLPdaMrKwsCwXX0KDg12AN/oDbGLGYXXbZZf0pKxRP6E9CPBKeAjX0J7+ystJRca2GI36MQSl+yHitNlR/zZo1Gpv1ae9Vq1YZzZWuAiyuvlVi5OoqTb+HY/172yTZt16/ZMkSIzrCFY5g7dq1Fk34dh7HHp5Pzdi0WsM1YtIba8BMaDuEp7HIWXSgKWWofYnKynH/QXGGDh48eDsHx5dv377dQlT9MWPGVCA4uSjq68BOlMHak1kIYT+yyiHkswAAEABJREFUQCimIXjxYlh2D1zNsOSJW52f1dTUHKBeEMH/MQrwECu/hVB3/vVlLOBshDVgZfIDfqr6xG3Sf9AxuGSXJlIR3ADW5mztJRPBD8dRHfURGiEfmsWknZslZ/xSZrncNeF0WvN9kygYE9IkdFGKo/EmC+XqiQu4Gjelk221FODARV2JcuWhdJtFA0FxDW5QZhBKWZ+1whUgaGe4KZjKUZjQ/wtGYOUB0rNsJaNNfQ/xOizZfwtXgDAGAd0mDeoHXsL58DmksG5EWCg64r4NUR03nHj5LCChx8CgE7dN9o7+MUQdU5tEEVj54k5CXftJXaAbmmi3igh23927d1sheeGwt1Bw4nncmTGci9mPJmUhoFcfPeqsryiTYe/1TyycFVKXIJPXCwUXSUfAfQztU4Tw1FNPTWWlf912F9UnhP0OhD1H5cBxxsMl+T+EXP/BxBD2SXH3YbjW/YCA6iTfUmwNlCctNtfPceNAkyiYW2MNzZegx6Px/PPPr0IZPmKvoENlw9nTD3ft2nUT9cJX1dtt15H8mD+CAgbX7gW74OWXX07BqnX1UjD2KREKxj6k+qWXXrqavaAOti1SWDD9BxNWqB7rxXCcAosWqucPFsUoaIOCZnoiUgjOSBTMOmgn2eA/FCxinE4EGVt7p/zWmNckClZvyWmEGZBgY3k+i4I9gRJdyn7oiSiyaYWFhT/AjTMmqkBJ7R2Jhul2nn4E7J8CjCkV66ikIyBUMbwkoHIMRfgs1vKdKVOmKMhwA+ldIgC9FEC3SYP6wcKh/WPcoA+LzQS5qEk34lIBS1jtxjuNR0ce8MJXsDr+xQhFXX6DLgQHjnit9g0inkBlBKqMQ90fIoRO3+C4GAV0FQDcOgVTVtmKoObY18nFaivBVtoFHN1i2qokSnfRsmXLOqLss+26CGGDAgHwWOdu59j03K7sP8e5KYRbneh8+hoytbi6r4wYMcLk5OQYwv0RQLjf4AJXoGi2Kx5NqtWlm0TB2L+8AqMNIVsLcJOMEzD5BkujPVJcxjPJChQkFEX0IsaeyPOtZfWT/v+a9kJChSUSnzwtGK6YcBybFi0U3nINwxCqw+6TvpWl4FzrfK+KHB3oVZnhwvXCi1fGYhkaG+7mnzdv3jwRJbqN/JsJJH0Vq/ZVFp+buH6ZI5ERHD343xipY2qIcXXpRrlgQZ5iIgYTVJjEqn0JluTzwBeAzwEXARcAF3JOdAXh5ndwwaQ8nm2npqZqxbaCDp6IHoW4S/1QsAu9VnS5hwQs5kaRaYeSpCFUUdknkghYUhYJhYwbsDlBPfauqqrKEDQZLSWKLa3NueqqqzrRTqb2bLU59ftlfxmy+PAhuGPHjvklJSXPsBA9x171Rc4IXyT9PPASZ3W1X3mtX1MtrlaTKJgmgVVzAyvav+DYW8Bc4DXgb4D2Nu9xfQeYw+Q8zATG3YSnpaUdmD17dhl16v2Hgnyb9lzry5oitBW4ibWHZ3WYpDtJoOuSjXUJWcj6EIS/ipR2nTZtWie3+iwkfTgoN8yDG0pC+SweEXLCgtiJhXEgHki/nj179gWyOJIYyOLVP1rh4XkA/MHwtRD+jgd3DPUKiYDm41KmhndAj2AB38Ayv0j09y2OW+biUdxPcCgvHC/Re7XNwjwI2bkZOk9Dd052dvY/cG1f4xjmafoxFdq5wkuUZrJ4EYwLr3yy7llhJ2DpPBWMyTCsjM9Onjy5IS5iBw6av4/ldB2a2mEVfnXVqlXhEUf9X169Giqkro06FLBAOeRGZskq4QEYjhq6RpZEpEbhQURkNDSB259/3nnnVZx11lklQ4cOLT3zzDN3ANvZk5WgMFu///3vz9Eb4nY7AwYMeALcdQj1QvZuHw0ePPhj8BYCy1m4XkO42+A1dEDQH50wYcIO5uAZPKAbsY6f2bZt22XgPDh27NgN5P+Us82En8Fk0T6Hfn3InK9nu/IsC+StWNvLmd+LWWSnIHO3skg8X1BQsBGc91gECuw+N+a1uRUsg8E9wmA9x8QeSG8jhw5pPZHdCy9hH9TOTVEk1KxwhhX/eQcS2W71HHATyqI9T5eShUcH3Qq4ONLDqhgEUXwZ7IhAJhbj4spKd6+aPsR1zSGjPXJoYSPg88333nsvsGDBAqM3CGzQo1jvv/++HpC+7KGHHrKeFRs2bFj7kSNHfkf5Kheo3sKFC/XmgUF5LsbqPYR1+RdHI/fMmzfPoAB6gsayuuzvDEpmlE8/7rj88stjHjkjP+JPyk0fn0C55q9fv75Q7aGsFk3xTMiaS7YwWrTNu+++q0/n/Qf9WIIVvlXljQnNrWDfWLt2bYoG7DYomKXn3l5E8ON+ds2NhvJZSe8iAqZbR2B/ZginB3EbPopGQNhzvPoofHCS4iXC7eoisqpbjxyxqmvf6apkiiTiAjkGOqCRgpW4SJZO/XMChFoKYb2O41Ru5zG20GKA0vZgj2oXxVx1zEHww+IFViPA+aFjdBWalvLgqt3DccpYIIZWeIbmDlp6rvNb4flR9+2nT5/+Knh3Ern19IrC69Ffs3z5cr2z9zRK9vXwsobeW4xoKJH61JevPn78+B94WS+E0LASmYqKip/Upw27DsrTD9fmHNwpOyvmirugB1zfJAp2OLqQfUFePAWjr46CFE0rLO2qYMJRfxA+SwEkjMqLBlkn9hSXRecrTf0uKJCr5aW/BrfL4J5ZL6OqjhugNCEFkzC69Uc0VYalCAVwwK9WXjRtFgBDsMTowWG5utHlTmnh457+gj53jy6Hnp65/CNKPSVRetE02IYY9oq/wZqdF11W33SzKRj7qQKUq5dXx1EMuRGbOUta4YUXrwxX42q5Gl54+Ol6euNlJxwUzPM5RKc6Dc2T9UKQ4ioYOGPoe8wjUywIA7XqI+COXZHQs+/QuZVcQEccp0zqxV1IwLEWDywJch+07qNpUaAgjeUKRpe5pWWNi4qKVOf6aBxkZSqW9Uo8neiihNMsDNbHkXBr/0YwxvELZAkTq0NsNgVjdb0lnlvAIM2KFSseY2V0nKS6MXhemMgU9gJ3aL/ihYh7qP3I2044KFgWAutUFMpDqOIKXgi59sYTPy0tzUgBBAhqbY2oX1Zr65EpsmMWKhRruFZyCQ3lMX+MybJg7H807pjy8AxopYSnm/NeCkR0McKNY5HpMGnSpF9p/+bVN/FR4IUjJUbmOsH3m73wEi1rLsZ1JDJ0s/YQbh0lCmQ9LcDk/sUNJ5F8lHMsypEDHVd0tQVjN+AixJzhoKABhLE3NFzrqwC8RuclbZZnZWUZ2lcTjqCoKMo9JrqQBWysXMjofDvNXlOH/IdY+Y/DIzvb8crYPBeD6ErQq/eCGE0rOg1P5NYWsHUIWRiU7hoCGh3cFhPcZYNrqadO3kcZ39I9/IkmHUprYYL+dMbd4DltMIFQr5K4wae/klBpCgNwrUWEyWzYsOFFLE+Dzr7YZ9wRz1LCdFnKp5wEg7x2WJPuXgrqOogGFIg3ROt+S+Ttl14KBn/0ZP3no5tizzlSFi46X2nGpDra2L+6Zs2aD5XXXIAsGC0iZ599thFoLrTgufVHfOF8TxHWkFtMMGc68uRYhbkzLOZ6qfQ/GOv5mzZtumTRokVncsRwiACRYx2dMaKsA1GyBr842iwKhjt2N2cSjoOzMzHRBkZGP6hrFyd0JQLZk3OXL3ut5PjtBp9bfv0fnIjSj/YIQYZWTqfypspjghXcWUTf/6jFxq0d9rFa0ScheCEro1A1rt9Qt0VBCib3m5X/TfZpq6nrRt7KpzxEm/tGs07qB/MjZXkY4e+O8Hfm3O7G4cOHK89qO/pHdehDKBvl1PtuY9zGykJjoPsb6H5gV0KB1q1evfp2WTY7L/oKbwyewcDo/GTTJ13BWDUGIdQjvCJ6WrFZedbi/hQnO6BwfIRzGq5DeFbMvYSXIMo/iFA5PqBKP9MAvWYSUzc8g8kICWF4fn3vJUQIzS4EqkhCgpKLVAxIwVhI8oh+hV74vO2229LhoWtgBt7qGOAA9BewiDmOO6ahJsiQtcI1f5EA1P1Y4rI9e/YcYs5+z+L7DAuba4vwROd/1rOcKE43nWm5IXOsYMB5I7qcBXOBl5tIP3Q8ErO3jaYTL33SFQyf/34Y6Nkvhac5FJ4BI+u9WuoYID8//wdaidwag77lnqBcT7vhIAAdWfHcipssXwqG0n7KIlOBAK2RUjg1Rv8MC4QWgNCeBOHoRT3lOVUxWrk5f5yD9dpE/Sq15YjYhJniPZ6MnpK5P7oZFrTniIxGZ0ek4Y0lGyhKT/AjysITyJs+YfBJeJ7uWbAqAd06gtxrXNV+joVJZJ5UBWNV7cuq9ZV4wY3c3NwqXBg9t5jEUCJROQY4l3Yy5WpFlpxIKaKUl5cnQdQzkycKwu6YvI4IYVjOybmtE3prlWYP+U9459owCqiQd48whCFYBNeDVllEFNA6koA/jWp51Qf6btFESNGjgHWv/GiQ94AVjbGgCPZOlUXjh6fBsc7maKszNMKLIu7FGwI638VaDUfZ+sHHLBarbOp/U9Y/AjksIZr0wXoiJSw76duTqmCsOjdhLSTQrh1FsXQW8RwBjtCHVlyRPQpwMf4vK7QHhtHJvYHJy+lTzCSHVTzp+y+1jeDoYgF9/DsCYt07/WCxxNPQI1OszKM5+3NCtZ7aYH+mPc4yIdBOws/31eFblkP3DQXato4ioumwhfgUBYjOjkizeNr98HxPD/dTj0l9mXPFYgJepcjFdhRuM7L4n17yob6xAHeJaLQeiZOmYHLZCgoK7qio8H5VKDs7Ww+wPlOPsYRXSees5GoJXnhm9L2UefPmzbOi86PSrnuZKLxGTWqCIWit/ghckdw60o5/Gierc6FdiDCNc1Mw9sASagnnPuEjyK5P46s8GuiXZTmi88PTgUBA9PVVVdCdD5ptfCyFNUY7rSv7Qsty694NUBCrDcr1tjkX5z/o65N/Bi9A31mxQPeybCpzrlWbiwULud21Ocn/njQFu+SSS0axH3L99Jm6zmTrsZ1trCxFSicHEdgTtXJ5MRAhMAQG5Fq9GlEzNpHbHC6iugE/2uqKm7oLxTiAZVIyBhBIPfExTgVItF4PyXdTMIRGK/pahMx6ATQtLa3RFUx9UF8SAcZkK0oIHeWJq8TgxNQLEWiEG8Ygr6DBlE6agrGq3qKnmr16jOnWecUvEP64DPaiwx5jug4LvXBY8aXMe376059an3Fzw8U1G5yIgjEhjc5L9kf2+1JVBH3+rT479VNBGMZ8Fn0I4AalY+1cn51UVI2gyLvw2BJQaMZVMBaqeo0t3h5MY4F2jAVTfnMDi5oildYi1JC+1ItxyTbI5HfhrOlWrbRudZlwQ9RPbsULbjiJ5LNC98YyXea2gts0pMyE8P+oj+TYeU5X6GUjBE5FEXmsxG0iMuIkpAxxUGRdQ4ephLBfl3I41SGSpqfuiR+d0R2hHiL3B/pOqFYEkT2dXrEatoUAAA/KSURBVIK1yrGMcb8ShYtqWVJVYJ7iygx7lxAOliZ0r/qJAG1Yyu+Fy+JjK6Z9dUSn79bzlhws63/AMcOGDQuBztuiQeUcMJvRo0cbPKlXHIkmkZn04JOgHUJl0m/hYC+UdrrBUujTy7+KE3BwqhqRh7X5LjTimve+fftqrxdXmYk6JfTKPULRFLwMBSAQqAVdu3aNGKudkDJJqeDz11k4XL+Yhcup/1VGB6jL7boIYHv73u1K26GxJTJOFqRwfE8FANez3KNPCdWDH1pUPti1a9do5GIArnGugPtsYKAAbyeHBWwQPDwTGIoMnUmQrefKlSv/7tZ+ovkhRiRaIVk8vYU6YsSIGawGrlWZNDNo0CA9TdGg11JkKceOHXsPK7RrW3YB5yxVWCfPg+yZtf+hXjdZCLue25UxJMvLuAKC4oRo0teSXr16KfoX0wUUQIep5jOf+cyP4PX1CnrEIJGBOygFO4a7ntS7ddAP9QMycf/AD40Nvnjiw9sY2tSJa8FYkENteDUgBUP27kFxlnM0sY3ji80C0ls4gN4qQPlKwNmI4q1D4dZu2rRp3Zo1a6wgkBftE2XudynuRY1TMnHixAtYIXrAdFeCnTt3ljV5VwN1RUqgAGZds3HjxrjWS4IKE//KKuV5FDBlypQ2uFDdWGXjto4rlNCEhxGKK0S4nSF0xlZBaHoj7lcoL/yGch1v6PlNPWIWXhS6Ryj1kuOH4e+8sVp78kCVaTN8bEntj5n3uONUG8kCvLDpevZHVpu58TqGSbbppPCbXMGwFHGfO9Sr+my8H0uq51HIrPYB/OzvSdCiimKSspasYq5Pb9gVxo0bx/y0De2D7HynK8oQLoROKPXJC9FkVa9hdX1fVsiJEAJnvW6v6OnhwzHvjFpVsILaV0R8KxIFC70caSE5/NC2Lcw6vPYU6OjqzEtS+Kof3p7ScSDUNyc82lefm1zOndpWXpM2jDD0w0RPdptwdYA9gMnOzj7GXif0MKbykwXCzfpP5IYhMJ5V0RirPZBiPg1AXsQfB7L6hkdogx9RGJVAKBqdl6y8EfsjXN/3ZYWimraSsrKU6+BcX/y18qJ/tIdjnzY/PJ96cS1YOD7jTFphwus31j288VSs8HZQstBCFZ5/Mu4bXSjCO40wTGPV1QoSnh1xr8NeNpO/JQzdoJAoivN1tRVB3CGh9jhcnptIe4Rq0xFIByqxWQhebGYDcxhTKMghUrhby1B63SYN6h/ehOqt148N0IxrwWxcXUVH10QA1zII/YQVIRGaNg50LaWBR3ZWva4oXxsih+0HDRqUKtA9eQktqok02GQKplcm8vLyvsNm0rMfxJZ13vCUJ1L8wvaEVW9jE+uJyapnsrKyDHu9eE9vWHRY3TPiWUQLkR/R5tKof9CMmGjSpdo/4o4m3Y72uZmZmVXUj9iPoDBxn5pItjE8l1CVQMDSg1C6sW4I1CRMKlD3ZEl0hYEDB9575ZVX7uUIaU9hYeG+8ePH7x01atQejm4+ufTSS19hyxH+fGd09YTSTaZg06ZNG86+qpcOQd16wsAN51VLdu7cudoNJ5F83MP/IMyagUJ4orOimgEDBugbFO96ItYV0vdezWnBcJ8jpHPOnDnl8Gx3fRRMZ2gsQAsXLFgQ4SmgtHWjTeyCxWgSi5RY67FY9EevlcQWxMlBDgg6d3vkrbfe6vrGG29kvPbaa+mvv/56J64Zc+fO7Y48XclRjtcXrOK0UFvcZArGYe+9WIraVlx+9bIdbl2DXksRaVbmGdDRrSdok09wY+G6desiVnG3SgjygOa0YNH9mjx58nFCyR9ooYgui5dGmhTgiHkvCoWNV/WULqf/oW82unWUeYxwtYXHfrXz3r17rYirAkSkrf2r7nXMoTKs/lDhNgSaRMFwEfqxYl6HBfDsW25ursLznmdRngQopK3+bN4/I8aQ9PyTW8Hey/HNZaeKhOjzmlPBEIwYa4FXMEfjcOqvW56sFAuenkF0+qhPTBtudJSPQOtyygA8OiQr5tahOq8m5nEw9nBt8BDcqukxOpU12H1uEgVDAK5I5DxKq0ROTs4zRBq/g3WZiqt3I6vzDcCXgesJklyP8kwFvgY4vr5NW3fFs5TilIRMxwEwVt/JV1ZcoP3ceIuETaQpBA+aMY9fEXhZgOuipzHspuNeidAajZ0FIyLAoYpewqlyAfOiiwUItHX1+oHHIdeWMXihNriMed3HIutKRxFsFOlMB4QeXu6/+MIheIMPm5tEwXBHztHAHAYVkUX0UG/jXg4DfoE5fh4lepG6vwf+AMxG6WajaPqU9QtjxowpIUDRM5wAEbUMNqKu/9dyOC709RWlEg6XN4Xne91Tp19TWjCvtlUGX+yHfZW0gMVoK7yppMxKJ/IDH7XXLVq8eHHMu0KJKEC4wiTSXlPjEOXTc5qWEsOHMuTGtUkF2TgGupU6Fr6NiFJO8/J6KNfb1mtt/Ppem0TBsCr9mJS4fTpy5Ii+Ba+oXghwgaR0Idi9e7cRk3DttJkNvVQo4gi/vhKkR6yU9ARNAuH5JxGohM9xYHIf2vCkaxeyskdMoJ3fkCuWI/SdDZtOSUnJUXjyLxYeOyvuFUusR6nmMfak3EEnwliMBtMIp4uc1ItvzI0lu8hLJVa9COscTjZ0r/cP2XePZzvyMBHrDnovEVn4GluY270UDBnW9qVBH7xVJ6xO6qYxAZcknclsTJJ6yl70IiaXfcVtcjNV4AXqC8wVw+K9+xUio2MGJrFnnQ8fyj+ZNwiN4wt/ZWVlb0ppEukLCmF9og0hczzIpzyCp040o1d/J5zwPPqdsNJIkMPr1ueeANdTml+nupq/tWvX6hnOeznn2n333Xdv4yz0BQJdsoJOVSz3G29J3/JoUHxAxJtEwZi0hBmsTiQCUhIg9F+FsALhIXb/nKxgvPoSRtyqLewLS+Ph2uXTp09PZaFI+KtC9RhzXB7h/kQ8yWH3jb3DfM6zZNHtLNcrwm5YiLS4OK7G9Nu1rl0gGvY9+HEV0saln0xZIO44bfxkror62fgsHn/iLOs4fbOzIq7spaxnNN99991OH374YR+2CRHl0QnccMPC/dyyZcvKo8uSTTeJgiXbiUTxWUlDj/XgIl2Lwng+JWLTlYARCJkVCAQSdg+ZwI4ISJPxh7HEFTw22o44uKObNCYU0B6i6xU+ScFoLrjdFSlOAZVD/XAT4nAS4W4f+E3Cw7S0tBBdzvcqsFL3sdcK70a97sWvCRMmGLYTMV+7qg/BUCfrU9mtDoKc8CrnQsMxG4GzHuthwlOGDBkyA1fJES86U+4D+7iEw/Oqz6qtlxd1mxAgSEmNGeuYCF3HBeHJJ5/UgXMpfYxLA0HUWc/S5cuXH3ZChqch5XEqVx444XLi2CfhOQGy4EmfPW44bScSjnnQjTjbgs7PiJS6vjPnSCQqU8pVUFBg2O9/Dhey3gtSONl6DS6cgNM9gw1ZGqfy+uaxclvnEvjHE/ft25fQm8bso/Q/tOx47LHHkooIoTA9Eg3RazwovaX8um8sQIgcaV533XXVWNiPFB2M1xautNydt6HluADAU08FEH1crPDjgrgHu6ojoF5c2ihvxONgqodLH96esmKA8UQoGG7fpyjFxQQz3mSPFYMfLwN61ie2sb7Tli5d2qBPBoa31SQKRlSnUpvL8IYaeo/Shkiw+XoQlyCU9rphsrQizZJQeuFFl+F+9cC3j852TDNePU/paCEcK9Rlql7dbcxFZbioEY81hSPhFv0tEQVj76mIrOubuVoY3PaxCJs2+tr0h5QTpTnqhg+tGHzkoI3ohPdd98JlfDrQjZFB8ANuixvti9f6/FxMPUUUZ8yYMYUx/3DcuHF2YEzNeUJOTo5eVi1m31WwaNGiFzyRkyyM6WSS9R3R6ejr6jSWxnq4FtNtHXTW5yoa2m+wMgWxKuUKs+LyFeiwVWVuNO2ywsLCIIrya8eOemeWDhgwwOq/TSu6LeUL8vLyDG3M8yYXWYrlqOjfv/8R1RfYtHUvYLxy7Vz/Ywbc4//PGeAheGH10a5vX8Uf3Gh9j6IYwVsQ2fqJFKHq+XpkTW0K7Pq61/gHDhwoBdtt1yDsPY9onBF9G1dX4asvmZmZB8CxHkVjH/Mp56HzRUPlAhuXsYtGFcp60KYddj3Su3fvShtXV4HqixZBiHIs+J4w/NCtFtL169c/sX379mGM/0/nnXfeUX3rRfwUDYH2aiNGjDCTJk0ykydPXkMkc9rjjz8+hnrLQoQa6aZJFIyO/g+rk/5T6Svo5/WsYtey8nwBZl7CyjS5Di6srKy8ADgf0PUC5dfhXI7F+iJW5Ab2GV9hH3HDpk2bcnEDKmDI8eLi4rPZw0wFbsHF+Dp4NyGwXwW+gqm/kfQN1LmRuteA24+J3kI/kvorLS1dvmXLlnxo3Yil+Cau5reh903Stwpo+zbcr+8yOdM5l7p41apVc5JpAKGv3Lp162jVR5geAh5DgB5H8Cyg/PPsm95xo0nQZg9H9YPp21dYse/AUk/n/tt1/boFIfwme4ovrl69eiJhbFfrOmvWrD8wN1eziN2H0jzE9SH68CDwEP2ZQf2Cjz/+2FIY9QXPYQ5K+Vn6ex+u2Az6fyfX7xHVnE6bN8Pv0fDikHCZiyD4XwDnFhTjYYT7cZT2YQT8UejPpP/n2LjCtwHeH6HeufRlBngP09ajdj3u7yK6N45yJ8W0Seg/U1xNX77EuWF3thP98QjGMM6LQPgM8ng+cjYSHmbOmzdvOPRewOLZ7jgojffXJAoGY2tYQZYxsXOAPzKQPyMwr+HWvIV1e7cO3iHw8B7wPqDre8qvw3kdof0rzJmNcszSdc2aNSX2sKG9jgji71C4Z1GC31L+PML6IjCLyfk96dko5O+Bv1C+066XzJUxBKG1gvq/Z8F4mrZ+Bb2nof3/BOQ9Q5+eQgB/zv0/wU9q86++aByqj8//wJIlS+7FPbln4cKFFqxYsWJuPJr0YxeCNgtB/RnXn7MH+RV9eQaazyJcTwP6LELM0xtq2wYJFviv0P6jKNIDAkLZM+nHA1x/jPBFrOrqE+P+O/mPsgD8GAX5b65Pkv451+coC82T2mBOyoqKip5dsGDB/RqfrvPnz78PeJD8JcJxAsZTRF9+TD/up2/32fU++uij/2JcG53qOOUxh0fgcylyuBQZnMf929u2bXsf+SmGX3s1Hqd6jZXXJArWWJ3z6fgcON054CvY6T6Dfv9PaQ74CnZKT4/fudOdA76Cne4zeFL77zeWLAd8BUuWYz6+z4EkOOArWBLM8lF9DiTLAV/BkuWYj+9zIAkO+AqWBLN8VJ8DyXLAV7BkOeaG7+f7HHDggK9gDkzxs3wONBYHfAVrLE76dHwOOHDAVzAHpvhZPgcaiwP/CwAA//9fYE0/AAAABklEQVQDAFNVjCHe8uBgAAAAAElFTkSuQmCC';


interface PowerPointOptions {
  inspection: InspectionData;
  photos: PhotoData[];
  additionalParts: AdditionalPart[];
  conclusion: string;
  language?: Language;
  translatedData?: {
    inspection: InspectionData;
    photos: PhotoData[];
    conclusion: string;
  };
}

interface HomePowerPointOptions {
  inspection: InspectionData;
  categories: PhotoCategory[];
  conclusion: string;
  language?: Language;
  translatedData?: {
    inspection: InspectionData;
    categories: PhotoCategory[];
    conclusion: string;
  };
}

export async function generatePowerPoint(options: PowerPointOptions): Promise<void> {
  const { inspection, photos, additionalParts, conclusion, language = 'pt', translatedData } = options;
  const isTranslated = language !== 'pt';
  
  // Use translated data if available, otherwise use original
  const finalInspection = translatedData?.inspection || inspection;
  const finalPhotos = translatedData?.photos || photos;
  const finalConclusion = translatedData?.conclusion || conclusion;
  
  const pptx = new pptxgen();
  
  // Set presentation properties
  pptx.author = 'Z-Services AI';
  pptx.title = `Relatório Técnico - ${finalInspection.tag || 'Máquina'}`;
  pptx.subject = finalInspection.descricao || 'Inspeção Técnica';
  
  // Generate slides
  generateCoverSlide(pptx, finalInspection, language);
  
  // Slide de Identificação da Máquina (sempre gerado)
  generateMachineIdentificationSlide(pptx, finalInspection, language);
  
  generatePhotoSlides(pptx, finalPhotos, language);
  generatePartsTableSlides(pptx, finalPhotos, additionalParts, language);
  
  if (finalConclusion.trim()) {
    generateConclusionSlide(pptx, finalConclusion, language);
  }
  
  generateFinalSlide(pptx, language);
  
  // Save the file
  const fileName = `Relatorio_${finalInspection.tag || 'Inspecao'}_${formatDateForFileName(finalInspection.data)}.pptx`;
  const blob = await pptx.write({ outputType: 'blob' }) as Blob;
  saveAs(blob, fileName);
}

// ============================================
// HOME POWERPOINT - Com Categorias
// ============================================
export async function generateHomePowerPoint(options: HomePowerPointOptions): Promise<void> {
  const { inspection, categories, conclusion, language = 'pt', translatedData } = options;
  const isTranslated = language !== 'pt';
  
  // Use translated data if available, otherwise use original
  const finalInspection = translatedData?.inspection || inspection;
  const finalCategories = translatedData?.categories || categories;
  const finalConclusion = translatedData?.conclusion || conclusion;
  
  const pptx = new pptxgen();
  
  // Set presentation properties
  pptx.author = 'Z-Services AI';
  pptx.title = `Relatório Técnico - ${finalInspection.tag || 'Máquina'}`;
  pptx.subject = finalInspection.descricao || 'Inspeção Técnica';
  
  // Generate slides
  generateCoverSlide(pptx, finalInspection, language);
  
  // Slide de Identificação da Máquina (sempre gerado)
  generateMachineIdentificationSlide(pptx, finalInspection, language);
  
  // Generate category slides
  finalCategories.forEach((category, index) => {
    const photosWithImages = category.photos.filter(p => p.imageData);
    if (photosWithImages.length > 0) {
      generateCategorySlides(pptx, category, index + 1, language);
    }
  });
  
  // Collect all parts from all categories for the parts table
  const allPhotos: PhotoData[] = [];
  const allAdditionalParts: AdditionalPart[] = [];
  finalCategories.forEach(category => {
    allPhotos.push(...category.photos);
    allAdditionalParts.push(...category.additionalParts);
  });
  
  generatePartsTableSlides(pptx, allPhotos, allAdditionalParts, language);
  
  if (finalConclusion.trim()) {
    generateConclusionSlide(pptx, finalConclusion, language);
  }
  
  generateFinalSlide(pptx, language);
  
  // Save the file
  const fileName = `Relatorio_Home_${finalInspection.tag || 'Inspecao'}_${formatDateForFileName(finalInspection.data)}.pptx`;
  const blob = await pptx.write({ outputType: 'blob' }) as Blob;
  saveAs(blob, fileName);
}

// Helper function to get translated category title and description
function getCategoryTranslation(categoryId: string, language: Language): { title: string; description: string } {
  const titleKey = `category.${categoryId}`;
  const descKey = `category.${categoryId}Desc`;
  
  return {
    title: t(titleKey, language, { defaultValue: categoryId }),
    description: t(descKey, language, { defaultValue: '' }),
  };
}

function generateCategorySlides(
  pptx: pptxgen, 
  category: PhotoCategory, 
  categoryNumber: number,
  language: Language
) {
  const isTranslated = language !== 'pt';
  const photosWithImages = category.photos.filter(p => p.imageData);
  const slideCount = Math.ceil(photosWithImages.length / 2);
  
  // Get translated title
  const { title: translatedTitle } = getCategoryTranslation(category.id, language);
  
  for (let i = 0; i < slideCount; i++) {
    const slide = pptx.addSlide();
    
    // Header with category number (use translated title, no line break)
    addCategoryHeader(slide, `${categoryNumber}. ${translatedTitle.toUpperCase()}`);
    
    const photo1 = photosWithImages[i * 2];
    const photo2 = photosWithImages[i * 2 + 1];
    
    // Photo 1
    if (photo1?.imageData) {
      addPhotoToSlide(slide, photo1, 0.3, 1.7, 4.4, 2.8, language);
    }
    
    // Photo 2
    if (photo2?.imageData) {
      addPhotoToSlide(slide, photo2, 4.9, 1.7, 4.4, 2.8, language);
    }
    
    addStandardFooter(slide);
  }
}

function generateCoverSlide(pptx: pptxgen, inspection: InspectionData, language: Language) {
  const isTranslated = language !== 'pt';
  const slide = pptx.addSlide();
  
  // Header
  addStandardHeader(slide, isTranslated ? 'INSPECTION' : 'INSPEÇÃO');
  
  // Title
  slide.addText(isTranslated ? 'Technical Report' : 'Relatório Técnico', {
    x: 0.3,
    y: 1.05,
    w: 6,
    h: 0.6,
    fontSize: 18,
    bold: true,
    color: '000000',
    fontFace: 'Arial',
  });
  
  // Info card background
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.3,
    y: 1.85,
    w: 9.4,
    h: 3.8,
    fill: { color: 'F8F9FA' },
    line: { color: 'E0E0E0', width: 1 },
  });
  
  // Left border
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.3,
    y: 1.85,
    w: 0.08,
    h: 3.8,
    fill: { color: 'FF6600' },
  });
  
  // Card title
  slide.addText(isTranslated ? 'Execution Information' : 'Informações da Execução', {
    x: 0.5,
    y: 1.93,
    w: 8,
    h: 0.35,
    fontSize: 9,
    bold: true,
    color: '000000',
    fontFace: 'Arial',
  });
  
  // Machine info
  let infoY = 2.3;
  const machineInfo = [
    { label: isTranslated ? 'TAG:' : 'TAG:', value: inspection.tag || '-' },
    { label: isTranslated ? 'Model:' : 'Modelo:', value: inspection.modelo || '-' },
    { label: 'SN:', value: inspection.sn || '-' },
    { label: isTranslated ? 'Delivery:' : 'Entrega:', value: inspection.entrega || '-' },
    { label: isTranslated ? 'Customer:' : 'Cliente:', value: inspection.cliente || '-' },
    { label: isTranslated ? 'Description:' : 'Descrição:', value: inspection.descricao || '-' },
    { label: 'MACHINE DOWN?:', value: inspection.machineDown || '-' },
  ];
  
  machineInfo.forEach(info => {
    slide.addText(info.label, {
      x: 0.5,
      y: infoY,
      w: 1.5,
      h: 0.22,
      fontSize: 9,
      bold: true,
      color: '000000',
      fontFace: 'Arial',
    });
    
    slide.addText(info.value, {
      x: 2,
      y: infoY,
      w: 7,
      h: 0.22,
      fontSize: 9,
      color: '000000',
      fontFace: 'Arial',
    });
    
    infoY += 0.22;
  });
  
  // Separator
  slide.addShape(pptx.ShapeType.line, {
    x: 0.5,
    y: infoY + 0.1,
    w: 8.5,
    h: 0,
    line: { color: 'E0E0E0', width: 1, dashType: 'dash' },
  });
  
  // Report data section
  infoY += 0.25;
  slide.addText(isTranslated ? 'REPORT DATA' : 'DADOS DO RELATÓRIO', {
    x: 0.5,
    y: infoY,
    w: 8,
    h: 0.22,
    fontSize: 8,
    bold: true,
    color: 'FF6600',
    fontFace: 'Arial',
  });
  
  infoY += 0.22;
  
  const reportInfo = [
    { 
      label: isTranslated ? 'Execution Date:' : 'Data da Execução:', 
      value: formatDateForDisplay(inspection.data) || '-' 
    },
  ];
  
  // Add Data Final if provided
  if (inspection.dataFinal) {
    reportInfo.push({
      label: isTranslated ? 'End Date:' : 'Data Final:',
      value: formatDateForDisplay(inspection.dataFinal),
    });
  }
  
  // Add OS de Execução if provided
  if (inspection.osExecucao) {
    reportInfo.push({
      label: isTranslated ? 'Work Order:' : 'OS de Execução:',
      value: inspection.osExecucao,
    });
  }
  
  reportInfo.push(
    { 
      label: isTranslated ? 'Names of Performers:' : 'Nomes dos Executantes:', 
      value: inspection.inspetor || '-' 
    },
    { 
      label: isTranslated ? 'Hour Meter:' : 'Horímetro:', 
      value: inspection.horimetro || '-' 
    }
  );
  
  reportInfo.forEach(info => {
    slide.addText(info.label, {
      x: 0.5,
      y: infoY,
      w: 1.5,
      h: 0.22,
      fontSize: 9,
      bold: true,
      color: '000000',
      fontFace: 'Arial',
    });
    
    slide.addText(info.value, {
      x: 2,
      y: infoY,
      w: 7,
      h: 0.22,
      fontSize: 9,
      color: '000000',
      fontFace: 'Arial',
    });
    
    infoY += 0.22;
  });
  
  // Footer
  addStandardFooter(slide);
}

function generateMachineIdentificationSlide(pptx: pptxgen, inspection: InspectionData, language: Language) {
  const isTranslated = language !== 'pt';
  const slide = pptx.addSlide();
  addStandardHeader(slide, isTranslated ? 'MACHINE IDENTIFICATION' : 'IDENTIFICAÇÃO DA MÁQUINA');
  
  // Title
  slide.addText(isTranslated ? 'Machine Identification' : 'Identificação da Máquina', {
    x: 0.3,
    y: 1.1,
    w: 9.4,
    h: 0.4,
    fontSize: 16,
    bold: true,
    color: '000000',
    fontFace: 'Arial',
    align: 'center',
  });
  
  // Photo positions (3 columns) - centered on slide
  const photoWidth = 2.8;
  const photoHeight = 2.8;
  const gap = 0.4;
  const totalWidth = (photoWidth * 3) + (gap * 2);
  const startX = (10 - totalWidth) / 2; // Center the photo group
  const photoY = 1.7;
  
  // Photo 1: Equipamento
  const photo1X = startX;
  slide.addShape(pptx.ShapeType.rect, {
    x: photo1X,
    y: photoY,
    w: photoWidth,
    h: photoHeight,
    fill: { color: 'F5F5F5' },
    line: { color: 'CCCCCC', width: 2, dashType: 'dash' },
  });
  
  if (inspection.machinePhoto) {
    slide.addImage({
      data: inspection.machinePhoto,
      x: photo1X,
      y: photoY,
      w: photoWidth,
      h: photoHeight,
      sizing: { type: 'cover' },
    });
  } else {
    // Placeholder with camera icon
    slide.addText('📷', {
      x: photo1X,
      y: photoY + photoHeight / 2 - 0.6,
      w: photoWidth,
      h: 0.6,
      fontSize: 32,
      color: 'CCCCCC',
      fontFace: 'Arial',
      align: 'center',
    });
    slide.addText(isTranslated ? 'Equipment Photo' : 'Foto do Equipamento', {
      x: photo1X,
      y: photoY + photoHeight / 2,
      w: photoWidth,
      h: 0.4,
      fontSize: 10,
      color: '999999',
      fontFace: 'Arial',
      align: 'center',
      italic: true,
    });
  }
  
  // Label 1: TAG
  slide.addShape(pptx.ShapeType.rect, {
    x: photo1X,
    y: photoY + photoHeight,
    w: photoWidth,
    h: 0.5,
    fill: { color: 'FF6600' },
  });
  slide.addText(inspection.tag || (isTranslated ? 'Equipment TAG' : 'TAG do Equipamento'), {
    x: photo1X,
    y: photoY + photoHeight + 0.05,
    w: photoWidth,
    h: 0.4,
    fontSize: 11,
    bold: true,
    color: 'FFFFFF',
    fontFace: 'Arial',
    align: 'center',
  });
  
  // Photo 2: Horímetro
  const photo2X = startX + photoWidth + gap;
  slide.addShape(pptx.ShapeType.rect, {
    x: photo2X,
    y: photoY,
    w: photoWidth,
    h: photoHeight,
    fill: { color: 'F5F5F5' },
    line: { color: 'CCCCCC', width: 2, dashType: 'dash' },
  });
  
  if (inspection.horimetroPhoto) {
    slide.addImage({
      data: inspection.horimetroPhoto,
      x: photo2X,
      y: photoY,
      w: photoWidth,
      h: photoHeight,
      sizing: { type: 'cover' },
    });
  } else {
    // Placeholder with camera icon
    slide.addText('📷', {
      x: photo2X,
      y: photoY + photoHeight / 2 - 0.6,
      w: photoWidth,
      h: 0.6,
      fontSize: 32,
      color: 'CCCCCC',
      fontFace: 'Arial',
      align: 'center',
    });
    slide.addText(isTranslated ? 'Hour Meter Photo' : 'Foto do Horímetro', {
      x: photo2X,
      y: photoY + photoHeight / 2,
      w: photoWidth,
      h: 0.4,
      fontSize: 10,
      color: '999999',
      fontFace: 'Arial',
      align: 'center',
      italic: true,
    });
  }
  
  // Label 2: Horímetro
  slide.addShape(pptx.ShapeType.rect, {
    x: photo2X,
    y: photoY + photoHeight,
    w: photoWidth,
    h: 0.5,
    fill: { color: 'FF6600' },
  });
  slide.addText(`${isTranslated ? 'Hour Meter' : 'Horímetro'}: ${inspection.horimetro || '-'}`, {
    x: photo2X,
    y: photoY + photoHeight + 0.05,
    w: photoWidth,
    h: 0.4,
    fontSize: 11,
    bold: true,
    color: 'FFFFFF',
    fontFace: 'Arial',
    align: 'center',
  });
  
  // Photo 3: Serial Number
  const photo3X = startX + (photoWidth + gap) * 2;
  slide.addShape(pptx.ShapeType.rect, {
    x: photo3X,
    y: photoY,
    w: photoWidth,
    h: photoHeight,
    fill: { color: 'F5F5F5' },
    line: { color: 'CCCCCC', width: 2, dashType: 'dash' },
  });
  
  if (inspection.serialPhoto) {
    slide.addImage({
      data: inspection.serialPhoto,
      x: photo3X,
      y: photoY,
      w: photoWidth,
      h: photoHeight,
      sizing: { type: 'cover' },
    });
  } else {
    // Placeholder with camera icon
    slide.addText('📷', {
      x: photo3X,
      y: photoY + photoHeight / 2 - 0.6,
      w: photoWidth,
      h: 0.6,
      fontSize: 32,
      color: 'CCCCCC',
      fontFace: 'Arial',
      align: 'center',
    });
    slide.addText(isTranslated ? 'Serial Number Photo' : 'Foto do Número de Série', {
      x: photo3X,
      y: photoY + photoHeight / 2,
      w: photoWidth,
      h: 0.4,
      fontSize: 10,
      color: '999999',
      fontFace: 'Arial',
      align: 'center',
      italic: true,
    });
  }
  
  // Label 3: Serial Number
  slide.addShape(pptx.ShapeType.rect, {
    x: photo3X,
    y: photoY + photoHeight,
    w: photoWidth,
    h: 0.5,
    fill: { color: 'FF6600' },
  });
  slide.addText(`${isTranslated ? 'Serial Number' : 'Número de Série'}: ${inspection.sn || '-'}`, {
    x: photo3X,
    y: photoY + photoHeight + 0.05,
    w: photoWidth,
    h: 0.4,
    fontSize: 11,
    bold: true,
    color: 'FFFFFF',
    fontFace: 'Arial',
    align: 'center',
  });
  
  addStandardFooter(slide);
}

function generatePhotoSlides(pptx: pptxgen, photos: PhotoData[], language: Language) {
  const isTranslated = language !== 'pt';
  const photosWithImages = photos.filter(p => p.imageData);
  const slideCount = Math.ceil(photosWithImages.length / 2);
  
  for (let i = 0; i < slideCount; i++) {
    const slide = pptx.addSlide();
    addStandardHeader(slide, isTranslated ? 'PHOTOS' : 'FOTOS');
    
    const photo1 = photosWithImages[i * 2];
    const photo2 = photosWithImages[i * 2 + 1];
    
    // Photo 1
    if (photo1?.imageData) {
      addPhotoToSlide(slide, photo1, 0.3, 1.6, 4.4, 2.8, language);
    }
    
    // Photo 2
    if (photo2?.imageData) {
      addPhotoToSlide(slide, photo2, 4.9, 1.6, 4.4, 2.8, language);
    }
    
    addStandardFooter(slide);
  }
}

function addPhotoToSlide(
  slide: pptxgen.Slide, 
  photo: PhotoData, 
  x: number, 
  y: number, 
  w: number, 
  h: number,
  language: Language
) {
  const isTranslated = language !== 'pt';
  // Photo info overlay (if PN exists)
  if (photo.pn) {
    slide.addShape(slide._slideLayout?._presLayout?.pptx?.ShapeType?.rect || 'rect', {
      x: x,
      y: y - 0.4,
      w: w,
      h: 0.35,
      fill: { color: '000000', transparency: 70 },
    });
    
    let infoText = `${isTranslated ? 'Part Number:' : 'Numero da Peça:'} ${photo.pn}`;
    if (photo.partName) infoText += ` ${photo.partName}`;
    if (photo.quantity) infoText += ` ${isTranslated ? 'Qty:' : 'Qtd:'} ${photo.quantity}`;
    
    slide.addText(infoText, {
      x: x + 0.1,
      y: y - 0.35,
      w: w - 0.2,
      h: 0.25,
      fontSize: 9,
      color: 'FFFFFF',
      fontFace: 'Arial',
    });
  }
  
  // Photo
  slide.addImage({
    data: photo.editedImageData || photo.imageData || '',
    x: x,
    y: y,
    w: w,
    h: h,
    sizing: { type: 'cover' },
  });
  
  // Description
  if (photo.description) {
    slide.addShape(slide._slideLayout?._presLayout?.pptx?.ShapeType?.rect || 'rect', {
      x: x,
      y: y + h,
      w: w,
      h: 0.6,
      fill: { color: 'FF6600' },
    });
    
    slide.addText(photo.description.substring(0, 150), {
      x: x + 0.1,
      y: y + h + 0.05,
      w: w - 0.2,
      h: 0.5,
      fontSize: 8,
      color: 'FFFFFF',
      fontFace: 'Arial',
    });
  }
}

// Interface for hierarchical parts structure
interface PartRow {
  pn: string;
  serialNumber: string;
  partName: string;
  quantity: string;
  isSubPart: boolean;
  parentPn?: string;
  indent: number;
}

function generatePartsTableSlides(
  pptx: pptxgen, 
  photos: PhotoData[], 
  additionalParts: AdditionalPart[],
  language: Language
) {
  const isTranslated = language !== 'pt';
  // Build hierarchical parts structure
  const partRows: PartRow[] = [];
  
  // Process each main part and its sub-parts
  photos
    .filter(p => p.pn)
    .forEach(photo => {
      // Add main part
      partRows.push({
        pn: photo.pn,
        serialNumber: photo.serialNumber || '',
        partName: photo.partName || '-',
        quantity: photo.quantity || '-',
        isSubPart: false,
        indent: 0,
      });
      
      // Find and add all sub-parts for this main part
      const subParts = additionalParts.filter(ap => ap.parentPn === photo.pn);
      subParts.forEach(subPart => {
        partRows.push({
          pn: subPart.pn,
          serialNumber: subPart.serialNumber || '',
          partName: subPart.partName,
          quantity: subPart.quantity,
          isSubPart: true,
          parentPn: photo.pn,
          indent: 1,
        });
      });
    });
  
  // Add any orphan additional parts (without a parent in the current photos)
  const parentPns = new Set(photos.filter(p => p.pn).map(p => p.pn));
  additionalParts
    .filter(ap => !parentPns.has(ap.parentPn))
    .forEach(orphanPart => {
      partRows.push({
        pn: orphanPart.pn,
        serialNumber: orphanPart.serialNumber || '',
        partName: orphanPart.partName,
        quantity: orphanPart.quantity,
        isSubPart: false,
        parentPn: orphanPart.parentPn,
        indent: 0,
      });
    });
  
  if (partRows.length === 0) return;
  
  // Calculate slides needed (8 rows per slide - peças principais + sub-peças)
  const rowsPerSlide = 8;
  const slidesNeeded = Math.ceil(partRows.length / rowsPerSlide);
  
  for (let slideIndex = 0; slideIndex < slidesNeeded; slideIndex++) {
    const slide = pptx.addSlide();
    addStandardHeader(slide, isTranslated ? 'PARTS TABLE' : 'TABELA DE PEÇAS');
    
    // Table title with page indicator if multiple slides
    const titleText = slidesNeeded > 1 
      ? `${isTranslated ? 'Parts Table' : 'Tabela de Peças'} (${slideIndex + 1}/${slidesNeeded})`
      : (isTranslated ? 'Parts Table (Part Number)' : 'Tabela de Peças (Numero da Peça)');
    
    slide.addText(titleText, {
      x: 0.5,
      y: 1.2,
      w: 8,
      h: 0.4,
      fontSize: 14,
      bold: true,
      color: '000000',
      fontFace: 'Arial',
    });
    
    // Table header
    const headerY = 1.7;
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5,
      y: headerY,
      w: 9,
      h: 0.4,
      fill: { color: '000000' },
    });
    
    const headers = [
      { text: isTranslated ? 'PN (Serial)' : 'PN (Serial)', x: 0.5, w: 2.5 },
      { text: isTranslated ? 'Part Name' : 'Nome da Peça', x: 3, w: 3 },
      { text: isTranslated ? 'Qty' : 'Qtd', x: 6, w: 1 },
      { text: isTranslated ? 'Type' : 'Tipo', x: 7, w: 2.5 },
    ];
    
    headers.forEach(header => {
      slide.addText(header.text, {
        x: header.x,
        y: headerY + 0.05,
        w: header.w,
        h: 0.3,
        fontSize: 10,
        bold: true,
        color: 'FFFFFF',
        fontFace: 'Arial',
        align: 'center',
      });
    });
    
    // Table rows
    const startIdx = slideIndex * rowsPerSlide;
    const endIdx = Math.min(startIdx + rowsPerSlide, partRows.length);
    const slideParts = partRows.slice(startIdx, endIdx);
    
    let rowY = headerY + 0.4;
    const rowHeight = 0.35;
    
    slideParts.forEach((part, idx) => {
      // Row background - different colors for main and sub-parts
      const bgColor = part.isSubPart ? 'FFF5E6' : (idx % 2 === 0 ? 'F8F9FA' : 'FFFFFF');
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.5,
        y: rowY,
        w: 9,
        h: rowHeight,
        fill: { color: bgColor },
        line: part.isSubPart ? { color: 'FFE0B2', width: 0.5 } : undefined,
      });
      
      // Sub-part indicator (arrow or dash)
      if (part.isSubPart) {
        slide.addText('└─', {
          x: 0.5,
          y: rowY + 0.05,
          w: 0.3,
          h: rowHeight - 0.1,
          fontSize: 9,
          color: 'FF6600',
          fontFace: 'Arial',
          align: 'center',
          valign: 'middle',
        });
      }
      
      // Part Number with Serial (with indent for sub-parts)
      const pnX = part.isSubPart ? 0.75 : 0.5;
      const pnText = part.serialNumber 
        ? `${part.pn} (${part.serialNumber})`
        : part.pn;
      slide.addText(pnText, {
        x: pnX,
        y: rowY + 0.05,
        w: part.isSubPart ? 2.25 : 2.5,
        h: rowHeight - 0.1,
        fontSize: part.isSubPart ? 8 : 9,
        color: part.isSubPart ? 'CC5200' : '000000',
        fontFace: 'Arial',
        align: 'center',
        valign: 'middle',
        italic: part.isSubPart,
      });
      
      // Part Name
      slide.addText(part.partName, {
        x: 3,
        y: rowY + 0.05,
        w: 3,
        h: rowHeight - 0.1,
        fontSize: part.isSubPart ? 8 : 9,
        color: part.isSubPart ? '666666' : '000000',
        fontFace: 'Arial',
        align: 'center',
        valign: 'middle',
        italic: part.isSubPart,
      });
      
      // Quantity
      slide.addText(part.quantity, {
        x: 6,
        y: rowY + 0.05,
        w: 1,
        h: rowHeight - 0.1,
        fontSize: part.isSubPart ? 8 : 9,
        color: '000000',
        fontFace: 'Arial',
        align: 'center',
        valign: 'middle',
      });
      
      // Type column
      const typeText = part.isSubPart 
        ? (isTranslated ? '↳ Sub-part' : '↳ Sub-peça')
        : (isTranslated ? 'Main' : 'Principal');
      
      slide.addText(typeText, {
        x: 7,
        y: rowY + 0.05,
        w: 2.5,
        h: rowHeight - 0.1,
        fontSize: part.isSubPart ? 8 : 9,
        color: part.isSubPart ? 'FF6600' : '000000',
        fontFace: 'Arial',
        align: 'center',
        valign: 'middle',
        italic: part.isSubPart,
      });
      
      rowY += rowHeight;
    });
    
    addStandardFooter(slide);
  }
}

function generateConclusionSlide(pptx: pptxgen, conclusion: string, language: Language) {
  const isTranslated = language !== 'pt';
  const slide = pptx.addSlide();
  addStandardHeader(slide, isTranslated ? 'CONCLUSION' : 'CONCLUSÃO');
  
  // Title
  slide.addText(isTranslated ? 'Conclusion' : 'Conclusão', {
    x: 0.5,
    y: 1.2,
    w: 8,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: '000000',
    fontFace: 'Arial',
  });
  
  // Conclusion text
  slide.addText(conclusion, {
    x: 0.5,
    y: 1.8,
    w: 9,
    h: 4,
    fontSize: 10,
    color: '000000',
    fontFace: 'Arial',
    valign: 'top',
  });
  
  addStandardFooter(slide);
}

function generateFinalSlide(pptx: pptxgen, language: Language = 'pt') {
  const isTranslated = language !== 'pt';
  const slide = pptx.addSlide();
  
  // Separator line
  slide.addShape(pptx.ShapeType.rect, {
    x: 4.5,
    y: 0.8,
    w: 1,
    h: 0.08,
    fill: { color: 'FF6600' },
  });
  
  // Logo
  slide.addImage({
    data: LOGO_BASE64,
    x: 3.5,
    y: 1.1,
    w: 3,
    h: 1.7,
    sizing: { type: 'contain' },
  });
  
  // Safety quote
  slide.addText('"If it\'s not safe, don\'t do it!"', {
    x: 1,
    y: 3.0,
    w: 8,
    h: 0.8,
    fontSize: 28,
    bold: true,
    color: 'FF6600',
    fontFace: 'Arial',
    align: 'center',
  });
  
  slide.addText('"There is nothing so important and urgent that it can\'t be done safely"', {
    x: 1,
    y: 4.0,
    w: 8,
    h: 0.6,
    fontSize: 22,
    bold: true,
    color: 'FF6600',
    fontFace: 'Arial',
    align: 'center',
  });
  
  // End text
  slide.addText(isTranslated ? 'END' : 'FIM', {
    x: 4,
    y: 5.0,
    w: 2,
    h: 0.8,
    fontSize: 28,
    bold: true,
    color: 'FF6600',
    fontFace: 'Arial',
    align: 'center',
  });
  
  // Footer
  slide.addText(isTranslated ? '© 2024 - Services Department | All rights reserved' : '© 2024 - Departamento de Serviços | Todos os direitos reservados', {
    x: 0.3,
    y: 7,
    w: 9.4,
    h: 0.3,
    fontSize: 8,
    color: '666666',
    fontFace: 'Arial',
    align: 'center',
  });
}

// Header específico para slides de categoria - título sem quebra de linha
function addCategoryHeader(slide: pptxgen.Slide, title: string) {
  // Logo
  slide.addImage({
    data: LOGO_BASE64,
    x: 0.3,
    y: 0.2,
    w: 1.5,
    h: 0.5,
    sizing: { type: 'contain' },
  });
  
  // Title - em uma única linha, ajustando automaticamente
  slide.addText(title, {
    x: 0.3,
    y: 0.2,
    w: 9.4,
    h: 0.5,
    fontSize: 10,
    bold: true,
    color: '000000',
    fontFace: 'Arial',
    align: 'right',
    valign: 'middle',
    autoFit: {
      shrinkText: true,
      fontSizeMin: 6, // Tamanho mínimo da fonte
    },
  });
  
  // Separator line
  slide.addShape('rect' as any, {
    x: 0.3,
    y: 0.9,
    w: 9.4,
    h: 0.04,
    fill: { color: 'FF6600' },
  });
}

function addStandardHeader(slide: pptxgen.Slide, title: string) {
  // Logo
  slide.addImage({
    data: LOGO_BASE64,
    x: 0.3,
    y: 0.2,
    w: 1.5,
    h: 0.5,
    sizing: { type: 'contain' },
  });
  
  // Title - largura total para evitar quebra de linha
  slide.addText(title, {
    x: 0.3,
    y: 0.2,
    w: 9.4,
    h: 0.5,
    fontSize: 10,
    bold: true,
    color: '000000',
    fontFace: 'Arial',
    align: 'right',
    valign: 'middle',
    autoFit: {
      shrinkText: true,
      fontSizeMin: 6,
    },
  });
  
  // Separator line
  slide.addShape('rect' as any, {
    x: 0.3,
    y: 0.9,
    w: 9.4,
    h: 0.04,
    fill: { color: 'FF6600' },
  });
}

function addStandardFooter(slide: pptxgen.Slide) {
  slide.addText('© 2024 - Departamento de Manutenção Industrial | Todos os direitos reservados', {
    x: 0.3,
    y: 7,
    w: 9.4,
    h: 0.3,
    fontSize: 8,
    color: '000000',
    fontFace: 'Arial',
    align: 'center',
  });
}

function formatDateForFileName(dateString: string): string {
  if (!dateString) return new Date().toISOString().split('T')[0];
  
  // Parse date manually to avoid timezone issues
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const day = parts[2].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[0];
    return `${day}-${month}-${year}`;
  }
  
  // Fallback: use current date
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatDateForDisplay(dateString: string): string {
  if (!dateString) return '';
  
  // Parse date manually to avoid timezone issues (YYYY-MM-DD format)
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const day = parts[2].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[0];
    return `${day}/${month}/${year}`;
  }
  
  return dateString;
}
