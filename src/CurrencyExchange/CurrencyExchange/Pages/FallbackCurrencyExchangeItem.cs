using Microsoft.CommandPalette.Extensions.Toolkit;
using System;
using System.Text.RegularExpressions;

namespace CurrencyExchange.Pages;

internal sealed partial class FallbackCurrencyExchangeItem() : FallbackCommandItem(new NoOpCommand(), "Fallback")
{
    public override void UpdateQuery(string query)
    {
        var match = ExchangeRegex().Match(query.Trim());
        if (!match.Success
            || !match.Groups.TryGetValue("amount", out var amountGroup)
            || !match.Groups.TryGetValue("from", out var fromCurrency))
        {
            Title = string.Empty;
            Subtitle = string.Empty;
            Command = null;
            return;
        }

        var amountSpan = RemoveCommas(amountGroup.ValueSpan);
        if (!double.TryParse(amountSpan, out var amount))
        {
            Title = string.Empty;
            Subtitle = string.Empty;
            Command = null;
            return;
        }

        Title = $"{amount * 2800} USDT";
        Subtitle = $"{amount} {fromCurrency}";
        Command = new CurrencyChartPage();
    }

    private static ReadOnlySpan<char> RemoveCommas(ReadOnlySpan<char> source)
    {
        var commaCount = 0;
        foreach (var c in source)
        {
            if (c == ',')
            {
                commaCount++;
            }
        }

        if (commaCount == 0)
        {
            return source;
        }

        var dest = new char[source.Length - commaCount];
        var writeIndex = 0;
        for (var i = 0; i < source.Length; i++)
        {
            var currentChar = source[i];
            if (currentChar != ',')
            {
                dest[writeIndex] = currentChar;
                writeIndex++;
            }
        }
        return dest;
    }

    [GeneratedRegex(@"^(?<amount>\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s?(?<from>[a-zA-Z$]+)$")]
    private static partial Regex ExchangeRegex();
}
