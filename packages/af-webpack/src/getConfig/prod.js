import UglifyPlugin from 'uglifyjs-webpack-plugin';
import uglifyOptions from './uglifyOptions';

export default function(webpackConfig, opts) {
  const disableCompress = process.env.COMPRESS === 'none';

  webpackConfig
    .mode('production')
    .bail(true)
    .devtool(opts.devtool);

  if (disableCompress && !process.env.__FROM_UMI_TEST) {
    webpackConfig.output.pathinfo(true);
    webpackConfig.optimization.namedModules(true).namedChunks(true);
  }

  if (opts.hash) {
    webpackConfig.output
      .filename(`[name].[chunkhash:8].js`)
      .chunkFilename(`[name].[chunkhash:8].async.js`);
  }

  webpackConfig.performance.hints(false);

  if (opts.manifest) {
    webpackConfig.plugin('manifest').use(require('webpack-manifest-plugin'), [
      {
        fileName: 'assets.json',
        ...opts.manifest,
      },
    ]);
  }

  webpackConfig.optimization
    // don't emit files if have error
    .noEmitOnErrors(true);

  if (disableCompress || process.env.__FROM_UMI_TEST) {
    webpackConfig.optimization.minimize(false);
  } else {
    webpackConfig
      .plugin('hash-module-ids')
      .use(require('webpack/lib/HashedModuleIdsPlugin'));

    webpackConfig.optimization.minimizer([
      new UglifyPlugin({
        ...uglifyOptions,
        sourceMap: !!opts.devtool,
      }),
    ]);
  }
}
