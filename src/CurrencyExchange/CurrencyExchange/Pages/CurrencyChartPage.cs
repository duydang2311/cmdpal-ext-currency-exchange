using Microsoft.CommandPalette.Extensions;
using Microsoft.CommandPalette.Extensions.Toolkit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurrencyExchange.Pages;

internal sealed partial class CurrencyChartPage : ContentPage
{
    public override IContent[] GetContent()
    {
        return [new MarkdownContent("""
            ![chart](https://pub-9d816ab396544f289115eac5843d60ab.r2.dev/chart.svg?--x-cmdpal-fit=fit&--x-cmdpal-upscale=true)
            ![test](data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==)
            """)];
    }
}
