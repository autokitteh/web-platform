# Docker Image Caching Action

This action provides intelligent Docker image caching to avoid rate limiting issues from Docker registries, particularly useful for ECR Public Registry and Docker Hub.

## Features

- 🗂️ **Smart Caching**: Automatically generates cache keys based on image names
- 🔄 **Incremental Updates**: Merges new images with existing cache
- ⚡ **Fast Restoration**: Loads cached images before attempting pulls
- 🛡️ **Rate Limit Protection**: Includes retry logic and specific ECR error handling
- 📊 **Detailed Reporting**: Provides comprehensive cache hit/miss reporting
- 🔍 **AutoKitteh Updates**: Intelligent version checking and automatic updates for AutoKitteh images

## Usage

### Basic Usage

```yaml
- name: Cache Docker Images
  uses: ./.github/actions/cache-docker-images
  with:
    cache-key: "my-project-images"
    images: "postgres:15-alpine,temporalio/auto-setup:1.24.2,public.ecr.aws/autokitteh/server:latest"
```

### Advanced Usage

```yaml
- name: Cache Docker Images
  id: docker-cache
  uses: ./.github/actions/cache-docker-images
  with:
    cache-key: "test-env-images-v2"
    images: "postgres:15-alpine,temporalio/auto-setup:${{ matrix.temporal-version }},public.ecr.aws/autokitteh/server:latest"
    restore-only: "false"

- name: Check cache results
  run: |
    echo "Cache hit: ${{ steps.docker-cache.outputs.cache-hit }}"
    echo "Loaded images: ${{ steps.docker-cache.outputs.images-loaded }}"
```

### AutoKitteh Update Checking

```yaml
- name: Cache Docker Images with AutoKitteh Updates
  id: docker-cache
  uses: ./.github/actions/cache-docker-images
  with:
    cache-key: "test-env-images-v2"
    images: "postgres:15-alpine,public.ecr.aws/autokitteh/server:v1.2.3"
    check-updates: "true"

- name: Check what was updated
  run: |
    echo "Cache hit: ${{ steps.docker-cache.outputs.cache-hit }}"
    echo "Loaded images: ${{ steps.docker-cache.outputs.images-loaded }}"
    echo "Updated images: ${{ steps.docker-cache.outputs.updated-images }}"
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `cache-key` | Base cache key for the Docker images | No | `"docker-images"` |
| `images` | Comma-separated list of Docker images to cache | Yes | - |
| `restore-only` | Only restore cache, don't save new cache | No | `"false"` |
| `check-updates` | Check for AutoKitteh updates and pull newer versions | No | `"false"` |

## Outputs

| Output | Description |
|--------|-------------|
| `cache-hit` | Whether the cache was restored (`"true"` or `"false"`) |
| `images-loaded` | Comma-separated list of images loaded from cache |
| `updated-images` | Comma-separated list of AutoKitteh images that were updated |

## How It Works

1. **Cache Key Generation**: Creates a unique cache key based on image names and runner OS
2. **Cache Restoration**: Attempts to restore previously cached Docker images
3. **Image Loading**: Loads cached images using `docker load`
4. **Missing Image Detection**: Identifies which images need to be pulled
5. **Smart Pulling**: Only pulls missing images with retry logic
6. **AutoKitteh Update Checking**: (Optional) Checks GitHub releases for newer AutoKitteh versions
7. **Intelligent Updates**: Only pulls AutoKitteh images if a newer version is available
8. **Cache Saving**: Saves newly pulled images to cache for future runs

## Integration with Existing Workflows

### Replace existing Docker pulls

**Before:**
```yaml
- name: Pull Docker images
  run: |
    docker pull postgres:15-alpine
    docker pull temporalio/auto-setup:1.24.2
    docker pull public.ecr.aws/autokitteh/server:latest
```

**After:**
```yaml
- name: Cache and pull Docker images
  uses: ./.github/actions/cache-docker-images
  with:
    cache-key: "my-workflow-images-v1"
    images: "postgres:15-alpine,temporalio/auto-setup:1.24.2,public.ecr.aws/autokitteh/server:latest"
```

### Use in matrix builds

```yaml
strategy:
  matrix:
    browser: [Chrome, Firefox, Safari]
    
steps:
  - name: Cache Docker images for ${{ matrix.browser }}
    uses: ./.github/actions/cache-docker-images
    with:
      cache-key: "test-images-${{ matrix.browser }}-v1"
      images: "postgres:15-alpine,temporalio/auto-setup:1.24.2,public.ecr.aws/autokitteh/server:latest"
```

## Benefits

- **Reduces Rate Limiting**: Avoids repeated pulls from registries
- **Faster Builds**: Cached images load much faster than network pulls
- **Cost Savings**: Reduces bandwidth usage in CI/CD
- **Reliability**: Builds continue even if registries have temporary issues
- **Smart Updates**: Only pulls AutoKitteh images when there's actually a new version
- **Version Awareness**: Automatically tracks and compares semantic versions

## Cache Behavior

- **Cache Duration**: GitHub Actions cache retention (up to 7 days by default)
- **Cache Size**: Compressed Docker images (typically 50-80% smaller)
- **Cache Scope**: Per repository and branch
- **Cache Keys**: Include image names hash to ensure consistency

## Error Handling

The action includes specific error handling for:
- ECR Public Registry rate limits
- Docker Hub rate limits  
- Network timeouts
- Corrupted cache files
- Missing images

## Troubleshooting

### Cache misses frequently
- Check if image tags are changing (use specific tags instead of `latest`)
- Verify cache key consistency across runs
- Consider cache size limits (10GB per repository)

### Images fail to load from cache
- Cache may be corrupted - action will fall back to pulling
- Check Docker daemon status
- Verify sufficient disk space

### Rate limiting still occurs
- Increase retry attempts in the action
- Consider using authenticated registry access
- Use alternative registries or mirrors

## AutoKitteh Update Feature

When `check-updates: "true"` is enabled, the action will:

1. **Check GitHub Releases**: Queries the AutoKitteh repository for the latest release
2. **Version Comparison**: Compares current image version with the latest release
3. **Smart Updates**: Only pulls if a newer version is available
4. **Cache Updates**: Automatically updates the cache with new versions
5. **Detailed Reporting**: Reports which images were updated

### Supported AutoKitteh Image Formats

- `public.ecr.aws/autokitteh/server:v1.2.3` - Specific version
- `public.ecr.aws/autokitteh/server:latest` - Always checks for updates
- Any image containing "autokitteh" in the name

## Version History

- **v1.0**: Initial release with basic caching
- **v1.1**: Added retry logic and ECR-specific error handling
- **v1.2**: Improved cache merging and cleanup
- **v1.3**: Added intelligent AutoKitteh version checking and updates